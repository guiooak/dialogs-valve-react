import React from "react";
import "./SectionLayout.css";

type SectionLayoutProps = {
  id: string;
  label: string;
  title: string;
  description: React.ReactNode;
  demo: React.ReactNode;
  code: React.ReactNode;
};

const SectionLayout: React.FC<SectionLayoutProps> = ({
  id,
  label,
  title,
  description,
  demo,
  code,
}) => {
  return (
    <section id={id} className="section">
      <div className="section-meta">
        <span className="section-number">{label}</span>
        <h2 className="section-title">{title}</h2>
      </div>
      <p className="section-desc">{description}</p>
      <div className="section-body">
        <div className="section-demo">{demo}</div>
        <div className="section-code">{code}</div>
      </div>
    </section>
  );
};

export default SectionLayout;
