import { useId } from "react";

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
}) {
  const summaryId = useId();

  return (
    <section className={`accordion ${className}`} aria-labelledby={summaryId}>
      <details className="accordion-details" open={isOpen}>
        <summary className={summaryClassName}>
          <div>
            {titleComponent ? (
              typeof titleComponent === "function" ? (
                titleComponent(summaryId)
              ) : Array.isArray(titleComponent) ? (
                titleComponent.map((el) =>
                  typeof el === "function" ? el(summaryId) : el,
                )
              ) : (
                titleComponent
              )
            ) : (
              <h2 id={summaryId}>{title}</h2>
            )}
          </div>
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
