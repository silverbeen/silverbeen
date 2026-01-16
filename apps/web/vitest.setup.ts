import "@testing-library/jest-dom/vitest";

// Enable React 19 act behavior for testing
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
