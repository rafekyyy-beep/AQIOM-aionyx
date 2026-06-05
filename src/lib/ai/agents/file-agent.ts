export interface FileAnalysis {
  filename: string;
  type: 'pdf' | 'docx' | 'txt' | 'csv' | 'image' | 'unknown';
  size: number;
  summary?: string;
}

export class FileAgent {
  async analyze(file: File): Promise<FileAnalysis> {
    const type = this.detectType(file.name);
    const size = file.size;

    const analysis: FileAnalysis = {
      filename: file.name,
      type,
      size,
    };

    if (type === 'txt') {
      analysis.summary = await this.readTextFile(file);
    }

    return analysis;
  }

  private detectType(filename: string): FileAnalysis['type'] {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'pdf';
      case 'docx': return 'docx';
      case 'txt': return 'txt';
      case 'csv': return 'csv';
      case 'png': case 'jpg': case 'jpeg': case 'gif': return 'image';
      default: return 'unknown';
    }
  }

  private async readTextFile(file: File): Promise<string> {
    const text = await file.text();
    return text.substring(0, 500) + (text.length > 500 ? '...' : '');
  }
}
