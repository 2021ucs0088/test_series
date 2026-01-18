import React from "react";
import styles from "./style.module.css";

const Page = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Online Test Series</h1>
      <p className={styles.subtitle}>
        Prepare for GATE, SEBI Grade A, UPSC & other competitive exams
      </p>

      <div className={styles.cardContainer}>
        <div className={styles.card}>
          <h2>GATE Test Series</h2>
          <p>Topic-wise, sectional & full-length tests</p>
          <button className={styles.btn}>Explore</button>
        </div>

        <div className={styles.card}>
          <h2>SEBI Grade A</h2>
          <p>IT, Quant, Reasoning & Current Affairs</p>
          <button className={styles.btn}>Explore</button>
        </div>

        <div className={styles.card}>
          <h2>UPSC Prelims</h2>
          <p>GS Paper-I mock tests with analysis</p>
          <button className={styles.btn}>Explore</button>
        </div>
      </div>
    </div>
  );
};

export default Page;
