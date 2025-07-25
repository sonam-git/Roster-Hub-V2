// src/components/SmoothTransition/index.jsx
import React from "react";

export function FadeInOut({ 
  show, 
  children, 
  duration = 200, 
  className = "", 
  fallback = null 
}) {
  const [shouldRender, setShouldRender] = React.useState(show);
  const [opacity, setOpacity] = React.useState(show ? 1 : 0);

  React.useEffect(() => {
    if (show) {
      setShouldRender(true);
      requestAnimationFrame(() => setOpacity(1));
    } else {
      setOpacity(0);
      const timer = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!shouldRender) {
    return fallback;
  }

  return (
    <div
      className={`transition-opacity ${className}`}
      style={{
        opacity,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function SlideIn({ 
  show, 
  children, 
  direction = "up", 
  duration = 300, 
  className = "" 
}) {
  const [shouldRender, setShouldRender] = React.useState(show);
  const [transform, setTransform] = React.useState(
    getInitialTransform(direction, !show)
  );

  function getInitialTransform(dir, hidden) {
    if (!hidden) return "translate(0, 0)";
    
    switch (dir) {
      case "up": return "translate(0, 20px)";
      case "down": return "translate(0, -20px)";
      case "left": return "translate(20px, 0)";
      case "right": return "translate(-20px, 0)";
      default: return "translate(0, 20px)";
    }
  }

  React.useEffect(() => {
    if (show) {
      setShouldRender(true);
      requestAnimationFrame(() => setTransform("translate(0, 0)"));
    } else {
      setTransform(getInitialTransform(direction, true));
      const timer = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timer);
    }
  }, [show, direction, duration]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`transition-transform ${className}`}
      style={{
        transform,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}
