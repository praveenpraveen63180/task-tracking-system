import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const RouterContext = createContext({
  pathname: window.location.pathname,
  navigate: () => {}
});

export function BrowserRouter({ children }) {
  const [pathname, setPathname] = useState(window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to, { replace = false } = {}) => {
    if (replace) {
      window.history.replaceState({}, '', to);
    } else {
      window.history.pushState({}, '', to);
    }
    setPathname(to);
  }, []);

  return (
    <RouterContext.Provider value={{ pathname, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useNavigate() {
  const context = useContext(RouterContext);
  return context.navigate;
}

export function useLocation() {
  const context = useContext(RouterContext);
  return { pathname: context.pathname };
}

export function Routes({ children }) {
  const { pathname } = useContext(RouterContext);
  const elements = React.Children.toArray(children);

  let matchedElement = null;

  for (const child of elements) {
    if (!React.isValidElement(child)) continue;
    const { path, element } = child.props;

    if (path === '*' || path === pathname) {
      matchedElement = element;
      break;
    }

    // Handle root path
    if (path === '/' && (pathname === '' || pathname === '/')) {
      matchedElement = element;
      break;
    }
  }

  return matchedElement;
}

export function Route({ path, element }) {
  return element;
}

export function Link({ to, children, className = '', onClick, ...props }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      navigate(to);
    }
  };

  return (
    <a href={to} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

export function Navigate({ to, replace = true }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace });
  }, [navigate, to, replace]);
  return null;
}
