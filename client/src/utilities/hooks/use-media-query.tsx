import * as React from "react";

export function useMediaQuery(query: string): boolean {
  const [value, setValue] = React.useState(false);

  React.useEffect(() => {
    const onChange = (event: MediaQueryListEvent): void => {
      setValue(event.matches);
    };

    const result: MediaQueryList = matchMedia(query);
    result.addEventListener("change", onChange);
    setValue(result.matches);

    return () => {
      result.removeEventListener("change", onChange);
    };
  }, [query]);

  return value;
}
