import { useState, useEffect, ReactNode, FC } from "react";
import { createPortal } from "react-dom";

import { CSSTransition } from "react-transition-group";

import { useFloating, shift, flip } from "@floating-ui/react-dom";

import { useSupportsTouch } from "Hooks/useSupportsTouch";

const TooltipWrapper: FC<{
  title: ReactNode;
  children: ReactNode;
  className?: string;
}> = ({ title, children, className }) => {
  const { x, y, reference, floating, strategy } = useFloating({
    placement: "top",
    middleware: [shift(), flip()],
  });

  const supportsTouch = useSupportsTouch();
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [wasClicked, setWasClicked] = useState<boolean>(false);

  const showTooltip = () => setIsHovering(true);
  const hideTooltip = () => setIsHovering(false);

  useEffect(() => {
    let timerShow: number | undefined;
    let timerHide: number | undefined;

    if (!isHovering) {
      if (isVisible) {
        window.clearTimeout(timerShow);
        timerHide = window.setTimeout(() => setIsVisible(false), 100);
      }
      setWasClicked(false);
    } else if (wasClicked) {
      window.clearTimeout(timerShow);
      window.clearTimeout(timerHide);
      setIsVisible(false);
    } else if (!isVisible) {
      clearTimeout(timerHide);
      timerShow = window.setTimeout(() => setIsVisible(true), 1000);
    }
    return () => {
      clearTimeout(timerShow);
      clearTimeout(timerHide);
    };
  }, [isHovering, isVisible, wasClicked]);

  return (
    <>
      <div
        onClick={() => setWasClicked(true)}
        onMouseOver={supportsTouch ? undefined : showTooltip}
        onMouseLeave={supportsTouch ? undefined : hideTooltip}
        onTouchStart={supportsTouch ? showTooltip : undefined}
        onTouchCancel={supportsTouch ? hideTooltip : undefined}
        onTouchEnd={supportsTouch ? hideTooltip : undefined}
        ref={reference}
        className={`${className ? className : ""} tooltip-trigger`}
      >
        {children}
      </div>
      {isVisible
        ? createPortal(
            <CSSTransition
              classNames="components-animation-tooltip"
              timeout={200}
              appear
              enter
              in
              unmountOnExit
            >
              <div
                className="tooltip tooltip-inner"
                ref={floating}
                style={{
                  position: strategy,
                  top: y ?? "",
                  left: x ?? "",
                }}
              >
                {title}
              </div>
            </CSSTransition>,
            document.body
          )
        : null}
    </>
  );
};

export { TooltipWrapper };
