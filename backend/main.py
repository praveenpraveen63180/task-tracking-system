import os, hmac, hashlib, secrets, base64, json
from datetime import datetime, timedelta, date, timezone
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, String, Text, Integer, Date, DateTime, ForeignKey, Boolean, select, func, or_
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker, Session, relationship

APP_SECRET = os.getenv('APP_SECRET', 'dev-only-secret-change-this-before-deployment-please')
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./taskflow.db')
connect_args = {'check_same_thread': False} if DATABASE_URL.startswith('sqlite') else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
class Base(DeclarativeBase): pass
class User(Base):
    __tablename__='users'
    id: Mapped[int]=mapped_column(primary_key=True)
    name: Mapped[str]=mapped_column(String(120))
    email: Mapped[str]=mapped_column(String(180), unique=True, index=True)
    password_hash: Mapped[str]=mapped_column(String(300))
    role: Mapped[str]=mapped_column(String(20), default='employee')
    department: Mapped[str]=mapped_column(String(100), default='Engineering')
    active: Mapped[bool]=mapped_column(Boolean, default=True)
    created_at: Mapped[datetime]=mapped_column(DateTime, default=datetime.utcnow)
class Project(Base):
    __tablename__='projects'
    id: Mapped[int]=mapped_column(primary_key=True)
    name: Mapped[str]=mapped_column(String(160), unique=True)
    description: Mapped[str]=mapped_column(Text, default='')
    status: Mapped[str]=mapped_column(String(30), default='Active')
    created_at: Mapped[datetime]=mapped_column(DateTime, default=datetime.utcnow)
class Task(Base):
    __tablename__='tasks'
    id: Mapped[int]=mapped_column(primary_key=True)
    title: Mapped[str]=mapped_column(String(200))
    description: Mapped[str]=mapped_column(Text, default='')
    assigned_to_id: Mapped[int]=mapped_column(ForeignKey('users.id'))
    project_id: Mapped[Optional[int]]=mapped_column(ForeignKey('projects.id'), nullable=True)
    status: Mapped[str]=mapped_column(String(30), default='To Do')
    priority: Mapped[str]=mapped_column(String(20), default='Medium')
    due_date: Mapped[Optional[date]]=mapped_column(Date, nullable=True)
    progress: Mapped[int]=mapped_column(Integer, default=0)
    created_by_id: Mapped[int]=mapped_column(ForeignKey('users.id'))
    created_at: Mapped[datetime]=mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime]=mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    started_at: Mapped[Optional[datetime]]=mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]]=mapped_column(DateTime, nullable=True)
class Activity(Base):
    __tablename__='activities'
    id: Mapped[int]=mapped_column(primary_key=True)
    actor_id: Mapped[Optional[int]]=mapped_column(ForeignKey('users.id'), nullable=True)
    task_id: Mapped[Optional[int]]=mapped_column(ForeignKey('tasks.id'), nullable=True)
    action: Mapped[str]=mapped_column(String(120))
    details: Mapped[str]=mapped_column(Text, default='')
    created_at: Mapped[datetime]=mapped_column(DateTime, default=datetime.utcnow)
Base.metadata.create_all(engine)
app=FastAPI(title='TaskFlow Production API', version='2.0.0', description='Role-based employee task tracking')
app.add_middleware(CORSMiddleware, allow_origins=os.getenv('CORS_ORIGINS','http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174').split(','), allow_credentials=True, allow_methods=['*'], allow_headers=['*'])
def db_dep():
    db=SessionLocal()
    try: yield db
    finally: db.close()
def hash_password(password: str) -> str:
    salt=secrets.token_bytes(16); digest=hashlib.pbkdf2_hmac('sha256',password.encode(),salt,310000)
    return base64.urlsafe_b64encode(salt).decode()+'.'+base64.urlsafe_b64encode(digest).decode()
def verify_password(password: str, stored: str) -> bool:
    try:
        s,d=stored.split('.'); salt=base64.urlsafe_b64decode(s); expected=base64.urlsafe_b64decode(d)
        return hmac.compare_digest(hashlib.pbkdf2_hmac('sha256',password.encode(),salt,310000),expected)
    except Exception: return False
def b64(data: bytes) -> str: return base64.urlsafe_b64encode(data).decode().rstrip('=')
def token_for(user: User) -> str:
    payload={'sub':user.id,'role':user.role,'exp':int((datetime.now(timezone.utc)+timedelta(hours=10)).timestamp())}
    body=b64(json.dumps(payload,separators=(',',':')).encode()); sig=b64(hmac.new(APP_SECRET.encode(),body.encode(),hashlib.sha256).digest())
    return body+'.'+sig
def current_user(authorization: Optional[str]=Header(default=None), db: Session=Depends(db_dep)) -> User:
    if not authorization or not authorization.startswith('Bearer '): raise HTTPException(401,'Please sign in to continue')
    try:
        body,sig=authorization[7:].split('.'); expected=b64(hmac.new(APP_SECRET.encode(),body.encode(),hashlib.sha256).digest())
        if not hmac.compare_digest(sig,expected): raise ValueError()
        payload=json.loads(base64.urlsafe_b64decode(body+'='*((4-len(body)%4)%4)))
        if payload['exp'] < int(datetime.now(timezone.utc).timestamp()): raise ValueError()
        user=db.get(User,int(payload['sub']))
        if not user or not user.active: raise ValueError()
        return user
    except Exception: raise HTTPException(401,'Session expired or invalid. Please sign in again')
def manager(user: User=Depends(current_user)) -> User:
    if user.role!='manager': raise HTTPException(403,'Manager access required')
    return user
def activity(db, actor, action, details='', task_id=None):
    db.add(Activity(actor_id=actor.id if actor else None, task_id=task_id, action=action, details=details))
def user_out(u): return {'id':u.id,'name':u.name,'email':u.email,'role':u.role,'department':u.department,'active':u.active,'created_at':u.created_at.isoformat() if u.created_at else None}
def project_out(p): return {'id':p.id,'name':p.name,'description':p.description,'status':p.status,'created_at':p.created_at.isoformat() if p.created_at else None}
def task_out(t, db):
    assignee=db.get(User,t.assigned_to_id); creator=db.get(User,t.created_by_id); project=db.get(Project,t.project_id) if t.project_id else None
    return {'id':t.id,'title':t.title,'description':t.description,'assigned_to_id':t.assigned_to_id,'assigned_to':assignee.name if assignee else 'Unknown','assignee_email':assignee.email if assignee else '', 'project_id':t.project_id,'project':project.name if project else 'General','status':t.status,'priority':t.priority,'due_date':t.due_date.isoformat() if t.due_date else None,'progress':t.progress,'created_by':creator.name if creator else 'Unknown','created_at':t.created_at.isoformat() if t.created_at else None,'updated_at':t.updated_at.isoformat() if t.updated_at else None,'started_at':t.started_at.isoformat() if t.started_at else None,'completed_at':t.completed_at.isoformat() if t.completed_at else None,'overdue':bool(t.due_date and t.due_date<date.today() and t.status!='Completed')}
class LoginIn(BaseModel): email: str; password: str
class MemberIn(BaseModel): name: str=Field(min_length=2,max_length=120); email: str; password: str=Field(min_length=8); role: str='employee'; department: str='Engineering'
class TaskIn(BaseModel): title: str=Field(min_length=2,max_length=200); description: str=''; assigned_to_id: int; project_id: Optional[int]=None; priority: str='Medium'; due_date: Optional[date]=None
class TaskUpdate(BaseModel): status: Optional[str]=None; progress: Optional[int]=Field(default=None,ge=0,le=100); title: Optional[str]=None; description: Optional[str]=None; assigned_to_id: Optional[int]=None; project_id: Optional[int]=None; priority: Optional[str]=None; due_date: Optional[date]=None
class ProjectIn(BaseModel): name: str=Field(min_length=2,max_length=160); description: str=''
@app.on_event('startup')
def seed():
    db=SessionLocal()
    try:
        if not db.query(User).first():
            users=[User(name='Praveen Kumar',email='manager@taskflow.local',password_hash=hash_password('Manager@123'),role='manager',department='Management'),User(name='Arun Kumar',email='arun@taskflow.local',password_hash=hash_password('Employee@123'),role='employee',department='Design'),User(name='Priya S',email='priya@taskflow.local',password_hash=hash_password('Employee@123'),role='employee',department='Engineering'),User(name='Rahul M',email='rahul@taskflow.local',password_hash=hash_password('Employee@123'),role='employee',department='Engineering')]
            db.add_all(users); db.flush()
        if not db.query(Project).first():
            db.add_all([Project(name='Website Redesign',description='Refresh the company website and improve the user experience.'),Project(name='Platform Engineering',description='Core APIs, reliability and delivery improvements.'),Project(name='Mobile Experience',description='Polish the mobile user journey.')]); db.flush()
        if not db.query(Task).first():
            us={u.email:u for u in db.query(User).all()}; ps={p.name:p for p in db.query(Project).all()}; now=date.today()
            samples=[('Design the new landing page','Prepare responsive landing page concepts and share a review link.','arun@taskflow.local','Website Redesign','High',now+timedelta(days=2),'In Progress',55),('Build task assignment API','Add validation, permissions and API documentation.','priya@taskflow.local','Platform Engineering','Urgent',now+timedelta(days=1),'To Do',0),('QA the dashboard flow','Test search, filters and responsive layouts.','rahul@taskflow.local','Website Redesign','Medium',now+timedelta(days=4),'To Do',0),('Review sprint priorities','Confirm scope and owners for the upcoming sprint.','arun@taskflow.local','Mobile Experience','Low',now-timedelta(days=1),'Completed',100)]
            for title,desc,email,proj,pri,due,status,prog in samples:
                t=Task(title=title,description=desc,assigned_to_id=us[email].id,project_id=ps[proj].id,priority=pri,due_date=due,status=status,progress=prog,created_by_id=us['manager@taskflow.local'].id,started_at=datetime.utcnow() if status=='In Progress' else None,completed_at=datetime.utcnow() if status=='Completed' else None)
                db.add(t); db.flush(); activity(db,us['manager@taskflow.local'],'Created task',title,t.id)
        db.commit()
    finally: db.close()
@app.get('/')
def home(): return {'name':'TaskFlow API','status':'online','docs':'/docs'}
@app.get('/api/health')
def health(db: Session=Depends(db_dep)):
    db.execute(select(1)); return {'status':'ok','database':'connected','app':'TaskFlow'}
@app.post('/api/auth/login')
def login(data: LoginIn, db: Session=Depends(db_dep)):
    u=db.scalar(select(User).where(func.lower(User.email)==data.email.lower().strip()))
    if not u or not verify_password(data.password,u.password_hash) or not u.active: raise HTTPException(401,'Incorrect email or password')
    activity(db,u,'Signed in','New session created'); db.commit()
    return {'access_token':token_for(u),'token_type':'bearer','user':user_out(u)}
@app.get('/api/auth/me')
def me(u: User=Depends(current_user)): return user_out(u)
@app.post('/api/auth/logout')
def logout(u: User=Depends(current_user), db: Session=Depends(db_dep)):
    activity(db,u,'Signed out','Session ended'); db.commit(); return {'message':'Signed out'}
@app.get('/api/dashboard')
def dashboard(u: User=Depends(current_user),db: Session=Depends(db_dep)):
    q=select(Task)
    if u.role!='manager': q=q.where(Task.assigned_to_id==u.id)
    tasks=db.scalars(q.order_by(Task.due_date.asc().nullslast(),Task.created_at.desc())).all()
    total=len(tasks); completed=sum(t.status=='Completed' for t in tasks); progress=sum(t.status=='In Progress' for t in tasks); overdue=sum(bool(t.due_date and t.due_date<date.today() and t.status!='Completed') for t in tasks)
    recent=db.scalars(select(Activity).order_by(Activity.created_at.desc()).limit(7)).all() if u.role=='manager' else db.scalars(select(Activity).where(or_(Activity.actor_id==u.id,Activity.task_id.in_(select(Task.id).where(Task.assigned_to_id==u.id)))).order_by(Activity.created_at.desc()).limit(7)).all()
    return {'stats':{'total':total,'completed':completed,'in_progress':progress,'to_do':sum(t.status=='To Do' for t in tasks),'overdue':overdue,'completion_rate':round(completed*100/total) if total else 0,'team_members':db.scalar(select(func.count(User.id)).where(User.role=='employee',User.active==True)) if u.role=='manager' else None},'tasks':[task_out(t,db) for t in tasks[:8]],'activity':[{'id':a.id,'actor':db.get(User,a.actor_id).name if a.actor_id and db.get(User,a.actor_id) else 'System','action':a.action,'details':a.details,'task_id':a.task_id,'created_at':a.created_at.isoformat()} for a in recent]}
@app.get('/api/tasks')
def list_tasks(status: Optional[str]=None, search: Optional[str]=None, u: User=Depends(current_user),db: Session=Depends(db_dep)):
    q=select(Task)
    if u.role!='manager': q=q.where(Task.assigned_to_id==u.id)
    if status and status!='All': q=q.where(Task.status==status)
    if search: q=q.where(or_(Task.title.ilike(f'%{search}%'),Task.description.ilike(f'%{search}%')))
    return [task_out(t,db) for t in db.scalars(q.order_by(Task.created_at.desc())).all()]
@app.post('/api/tasks',status_code=201)
def create_task(data: TaskIn,u: User=Depends(manager),db: Session=Depends(db_dep)):
    assignee=db.get(User,data.assigned_to_id)
    if not assignee or assignee.role!='employee' or not assignee.active: raise HTTPException(422,'Choose an active employee')
    if data.project_id and not db.get(Project,data.project_id): raise HTTPException(422,'Project not found')
    if data.priority not in ['Low','Medium','High','Urgent']: raise HTTPException(422,'Invalid priority')
    t=Task(title=data.title.strip(),description=data.description,assigned_to_id=assignee.id,project_id=data.project_id,priority=data.priority,due_date=data.due_date,created_by_id=u.id)
    db.add(t); db.flush(); activity(db,u,'Assigned task',f'{t.title} → {assignee.name}',t.id); db.commit(); db.refresh(t); return task_out(t,db)
@app.patch('/api/tasks/{task_id}')
def update_task(task_id:int,data:TaskUpdate,u:User=Depends(current_user),db:Session=Depends(db_dep)):
    t=db.get(Task,task_id)
    if not t: raise HTTPException(404,'Task not found')
    if u.role!='manager' and t.assigned_to_id!=u.id: raise HTTPException(403,'You can only access tasks assigned to you')
    changes=data.model_dump(exclude_unset=True); allowed_employee={'status','progress'}
    if u.role!='manager' and set(changes)-allowed_employee: raise HTTPException(403,'Employees can update only task status and progress')
    old_status=t.status
    if 'status' in changes and changes['status'] not in ['To Do','In Progress','Completed']: raise HTTPException(422,'Invalid task status')
    if 'priority' in changes and changes['priority'] not in ['Low','Medium','High','Urgent']: raise HTTPException(422,'Invalid priority')
    if 'assigned_to_id' in changes:
        target=db.get(User,changes['assigned_to_id'])
        if not target or target.role!='employee' or not target.active: raise HTTPException(422,'Choose an active employee')
    for k,v in changes.items(): setattr(t,k,v)
    if 'status' in changes:
        if t.status=='In Progress' and not t.started_at: t.started_at=datetime.utcnow()
        if t.status=='Completed': t.progress=100; t.completed_at=datetime.utcnow()
        elif old_status=='Completed': t.completed_at=None
        if t.status=='To Do' and t.progress==100: t.progress=0
    if 'progress' in changes and 'status' not in changes:
        if t.progress==100: t.status='Completed'; t.completed_at=datetime.utcnow()
        elif t.progress>0 and t.status=='To Do': t.status='In Progress'; t.started_at=t.started_at or datetime.utcnow()
    t.updated_at=datetime.utcnow(); db.flush()
    activity(db,u,'Updated task',f'{t.title}: '+', '.join(f'{k.replace("_"," ")} → {v}' for k,v in changes.items()),t.id)
    db.commit(); db.refresh(t); return task_out(t,db)
@app.delete('/api/tasks/{task_id}')
def delete_task(task_id:int,u:User=Depends(manager),db:Session=Depends(db_dep)):
    t=db.get(Task,task_id)
    if not t: raise HTTPException(404,'Task not found')
    activity(db,u,'Deleted task',t.title,t.id); db.delete(t); db.commit(); return {'message':'Task deleted'}
@app.get('/api/members')
def members(u:User=Depends(manager),db:Session=Depends(db_dep)):
    people=db.scalars(select(User).where(User.role=='employee').order_by(User.name)).all(); out=[]
    for p in people:
        out.append({**user_out(p),'task_count':db.scalar(select(func.count(Task.id)).where(Task.assigned_to_id==p.id)),'completed_count':db.scalar(select(func.count(Task.id)).where(Task.assigned_to_id==p.id,Task.status=='Completed'))})
    return out
@app.post('/api/members',status_code=201)
def add_member(data:MemberIn,u:User=Depends(manager),db:Session=Depends(db_dep)):
    if data.role not in ['employee']: raise HTTPException(422,'Only employee accounts can be created here')
    email=data.email.strip().lower()
    if db.scalar(select(User).where(User.email==email)): raise HTTPException(409,'An account with this email already exists')
    p=User(name=data.name.strip(),email=email,password_hash=hash_password(data.password),role='employee',department=data.department.strip() or 'Engineering')
    db.add(p); activity(db,u,'Added team member',f'{p.name} ({p.email})'); db.commit(); db.refresh(p); return user_out(p)
@app.patch('/api/members/{user_id}/active')
def member_active(user_id:int,active:bool,u:User=Depends(manager),db:Session=Depends(db_dep)):
    p=db.get(User,user_id)
    if not p or p.role!='employee': raise HTTPException(404,'Employee not found')
    p.active=active; activity(db,u,'Changed employee access',f'{p.name}: {"active" if active else "disabled"}'); db.commit(); return user_out(p)
@app.get('/api/projects')
def projects(u:User=Depends(current_user),db:Session=Depends(db_dep)):
    ps=db.scalars(select(Project).order_by(Project.name)).all(); out=[]
    for p in ps:
        q=select(Task).where(Task.project_id==p.id)
        if u.role!='manager': q=q.where(Task.assigned_to_id==u.id)
        ts=db.scalars(q).all(); done=sum(t.status=='Completed' for t in ts)
        out.append({**project_out(p),'task_count':len(ts),'completed_count':done,'progress':round(done*100/len(ts)) if ts else 0})
    return out
@app.post('/api/projects',status_code=201)
def add_project(data:ProjectIn,u:User=Depends(manager),db:Session=Depends(db_dep)):
    if db.scalar(select(Project).where(func.lower(Project.name)==data.name.lower().strip())): raise HTTPException(409,'Project name already exists')
    p=Project(name=data.name.strip(),description=data.description); db.add(p); db.flush(); activity(db,u,'Created project',p.name); db.commit(); db.refresh(p); return project_out(p)
@app.get('/api/activity')
def activity_feed(limit:int=50,u:User=Depends(current_user),db:Session=Depends(db_dep)):
    q=select(Activity)
    if u.role!='manager': q=q.where(or_(Activity.actor_id==u.id,Activity.task_id.in_(select(Task.id).where(Task.assigned_to_id==u.id))))
    rows=db.scalars(q.order_by(Activity.created_at.desc()).limit(min(max(limit,1),100))).all(); out=[]
    for a in rows:
        actor=db.get(User,a.actor_id) if a.actor_id else None
        task=db.get(Task,a.task_id) if a.task_id else None
        out.append({'id':a.id,'actor':actor.name if actor else 'System','action':a.action,'details':a.details,'task_id':a.task_id,'task_title':task.title if task else None,'created_at':a.created_at.isoformat()})
    return out
@app.get('/api/reports')
def reports(u:User=Depends(current_user),db:Session=Depends(db_dep)):
    q=select(Task)
    if u.role!='manager': q=q.where(Task.assigned_to_id==u.id)
    ts=db.scalars(q).all(); total=len(ts); completed=sum(t.status=='Completed' for t in ts)
    by_status={s:sum(t.status==s for t in ts) for s in ['To Do','In Progress','Completed']}
    by_priority={s:sum(t.priority==s for t in ts) for s in ['Urgent','High','Medium','Low']}
    return {'total':total,'completed':completed,'in_progress':by_status['In Progress'],'to_do':by_status['To Do'],'overdue':sum(bool(t.due_date and t.due_date<date.today() and t.status!='Completed') for t in ts),'completion_rate':round(completed*100/total) if total else 0,'by_status':by_status,'by_priority':by_priority}
