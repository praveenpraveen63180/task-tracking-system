export const initials = (s = '') =>
  s.split(/\s+/).map(v => v[0]).join('').slice(0, 2).toUpperCase();

export const dateText = v =>
  v
    ? new Date(v.length === 10 ? v + 'T00:00:00' : v).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: v.length > 10 ? 'numeric' : undefined
      })
    : 'No deadline';

export const timeAgo = v => {
  if (!v) return 'Just now';
  const m = Math.max(0, Math.floor((Date.now() - new Date(v).getTime()) / 60000));
  return m < 1
    ? 'Just now'
    : m < 60
    ? `${m}m ago`
    : m < 1440
    ? `${Math.floor(m / 60)}h ago`
    : dateText(v);
};

export function copyDemo(value) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(value).then(
      () => window.alert('Copied to clipboard'),
      () => window.prompt('Copy this value:', value)
    );
  } else {
    window.prompt('Copy this value:', value);
  }
}

export function pageTitle(page, isManager, name = '') {
  const titles = {
    overview: isManager ? 'Good to see you again' : `Your workspace, ${name.split(' ')[0]}`,
    tasks: isManager ? 'All tasks' : 'My tasks',
    projects: 'Projects',
    team: 'Team members',
    activity: 'Activity',
    reports: 'Reports'
  };
  return titles[page] || 'Overview';
}

export function pageSubtitle(page, isManager) {
  const subtitles = {
    overview: isManager ? 'Here is what is happening across your workspace.' : 'A clear view of your work and what needs attention.',
    tasks: isManager ? 'Track assignments, priorities, and deadlines.' : 'Review and update the work assigned to you.',
    projects: 'See progress across your active work.',
    team: 'Manage access and keep an eye on team workload.',
    activity: 'A running record of work across your workspace.',
    reports: 'A snapshot of delivery, priorities, and upcoming work.'
  };
  return subtitles[page] || '';
}
