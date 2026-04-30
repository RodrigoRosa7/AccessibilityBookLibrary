import styles from "./BookCardSkeleton.module.css";

export function BookCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div>
        <div className={`${styles.line} ${styles.title}`} />
        <div className={`${styles.line} ${styles.author}`} style={{ marginTop: 8 }} />
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        <div className={`${styles.line} ${styles.desc1}`} />
        <div className={`${styles.line} ${styles.desc2}`} />
        <div className={`${styles.line} ${styles.desc3}`} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
        <div className={`${styles.line} ${styles.price}`} />
        <div className={`${styles.line} ${styles.btn}`} />
      </div>
    </div>
  );
}
