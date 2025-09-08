import { Ansi_Escape_Codes } from "./Ansi_Escape_Codes.ts";

export const render_markdown_to_terminal = (markdown: string) => {
  const out_lines = [];
  for (const line of markdown.split("\n")) {
    if (line.startsWith("# ")) {
      out_lines.push(
        `${Ansi_Escape_Codes.fgGreen}${Ansi_Escape_Codes.underline}${render_code(line.slice(2))}${Ansi_Escape_Codes.reset}`
      );
      continue;
    }
    if (line.startsWith("## ")) {
      out_lines.push(
        `${Ansi_Escape_Codes.fgCyan}${Ansi_Escape_Codes.underline}${render_code(line.slice(3))}${Ansi_Escape_Codes.reset}`
      );
      continue;
    }
    out_lines.push(render_code(line));
  }
  console.log(out_lines.join("\n"));
};export const render_code = (line: string): string => {
  const out_line = [];
  let in_code = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] != "`") {
      out_line.push(line[i]);
      continue;
    }
    if (in_code) {
      out_line.push(Ansi_Escape_Codes.reset);
      in_code = false;
      continue;
    }
    in_code = true;
    out_line.push(Ansi_Escape_Codes.fgYellow);
  }
  return out_line.join("");
};

