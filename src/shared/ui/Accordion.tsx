import type { ReactNode } from "react";
import { useId } from "react";

type TitleComponentFn = (summaryId: string) => ReactNode;

interface AccordionProps {
  title?: string;
  titleComponent?: TitleComponentFn | ReactNode;
  isOpen?: boolean;
  children: ReactNode;
  className?: string;
  chevronClassName?: string;
  summaryClassName?: string;
  bodyClassName?: string;
  contentClassName?: string;
}

export function Accordion({
  title,
  titleComponent = null,
  isOpen = true,
  children,
  className = "",
  chevronClassName = "accordion-chevron",
  summaryClassName = "accordion-summary",
  bodyClassName = "accordion-body",
  contentClassName = "accordion-content",
}: AccordionProps) {
  const summaryId = useId();

  function renderTitle(): ReactNode {
    if (!titleComponent) return <h2 id={summaryId}>{title}</h2>;
    if (typeof titleComponent === "function") return titleComponent(summaryId);
    if (Array.isArray(titleComponent)) {
      return (
        titleComponent as Array<TitleComponentFn | ReactNode>
      ).map((el) => (typeof el === "function" ? el(summaryId) : el));
    }
    return titleComponent;
  }

  return (
    <section className={`accordion ${className}`} aria-labelledby={summaryId}>
      <details className="accordion-details" open={isOpen}>
        <summary className={summaryClassName}>
          <div>{renderTitle()}</div>
          <span className={chevronClassName} aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9l6 6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </summary>

        <div className={bodyClassName}>
          <div className={contentClassName}>{children}</div>
        </div>
      </details>
    </section>
  );
}
