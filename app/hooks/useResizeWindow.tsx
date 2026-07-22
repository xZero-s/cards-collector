import { useState, useEffect, useRef } from "react";

interface WindowSize {
  width: number;
  height: number;
}

type ResizeCallback = (size: WindowSize) => void;

export function useResizeWindow(callback?: ResizeCallback): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const newSize = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      setWindowSize(newSize);

      if (callbackRef.current) {
        callbackRef.current(newSize);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return windowSize;
}
