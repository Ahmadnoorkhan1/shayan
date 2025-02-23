declare namespace JSX {
    interface IntrinsicElements {
      ol: React.DetailedHTMLProps<React.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>;
      li: React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
      span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
      svg: React.SVGProps<SVGSVGElement>;
      path: React.SVGProps<SVGPathElement>;
    }
  }
  