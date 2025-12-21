# FastMCP Documentation Search Server 🚀

A Model Context Protocol (MCP) server that provides tools for web scraping and documentation search, built with FastMCP.

## Features

This MCP server provides four powerful tools:

### 1. **Documentation Search** 📚
Search through 239+ FastMCP documentation files (markdown and mdx) using a TF-IDF based search engine powered by [minsearch](https://github.com/alexeygrigorev/minsearch).

### 2. **Web Page to Markdown** 🌐
Convert any webpage to clean markdown format using [Jina Reader](https://jina.ai/reader/).

### 3. **Word Counter** 🔢
Count occurrences of specific words on any webpage (case-insensitive).

### 4. **Add Numbers** ➕
Simple addition utility (demo tool).

## Installation

### Prerequisites
- Python 3.10 or higher
- [uv](https://docs.astral.sh/uv/) (recommended) or pip

### Setup

1. **Clone or download this repository**

2. **Install dependencies**
   ```bash
   uv sync
   # or using pip:
   pip install fastmcp requests minsearch
   ```

3. **Download the documentation** (already included)
   The `fastmcp-main.zip` file contains the FastMCP documentation that will be indexed.

## Usage

### Running the MCP Server

```bash
uv run main.py
```

The server will:
- Load and index 239 documentation files
- Start in STDIO mode for MCP client connections
- Be ready to accept tool calls from any MCP client

### Available Tools

#### `search_documentation(query: str, num_results: int = 5)`
Search the FastMCP documentation.

**Parameters:**
- `query`: Search query (e.g., "how to create a tool", "installation")
- `num_results`: Number of results to return (default: 5, max: 10)

**Returns:** Formatted search results with filenames and content previews

**Example:**
```python
search_documentation("authentication", num_results=3)
```

#### `get_page_markdown(url: str)`
Fetch webpage content as markdown.

**Parameters:**
- `url`: The webpage URL (e.g., "https://datatalks.club")

**Returns:** Markdown-formatted content

**Example:**
```python
get_page_markdown("https://github.com/alexeygrigorev/minsearch")
```

#### `count_word_in_page(url: str, word: str)`
Count word occurrences on a webpage.

**Parameters:**
- `url`: The webpage URL
- `word`: Word to count (case-insensitive)

**Returns:** Count message

**Example:**
```python
count_word_in_page("https://datatalks.club", "data")
```

## Testing

### Test the Search Engine
```bash
python search.py
```

### Test Documentation Search
```bash
python test_doc_search.py
```

### Test Word Counting
```bash
python count_data.py
```

## Project Structure

```
AI_03_MCP/
├── main.py                   # MCP server with all tools
├── search.py                 # Documentation indexing and search logic
├── test_doc_search.py        # Documentation search tests
├── test.py                   # Web scraping tests
├── count_data.py             # Word counting tests
├── fastmcp-main.zip          # FastMCP documentation archive
├── pyproject.toml            # Project configuration
└── README.md                 # This file
```

## Technical Details

### Search Implementation
- **Engine**: minsearch (TF-IDF + cosine similarity)
- **Text Fields**: content, filename
- **Boost**: filename matches are weighted 2x more than content matches
- **Documents**: 239 markdown/mdx files from FastMCP repository

### Web Scraping
- **Service**: Jina Reader API (`r.jina.ai`)
- **Output**: Clean markdown format
- **Library**: requests

## MCP Integration

This server can be used with any MCP-compatible client:
- Claude Desktop
- VS Code with MCP extensions
- Custom MCP clients

### Configuration Example

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "fastmcp-docs": {
      "command": "uv",
      "args": ["run", "/path/to/AI_03_MCP/main.py"]
    }
  }
}
```

## Requirements

- Python 3.10+
- fastmcp >= 2.14.1
- requests
- minsearch
- scikit-learn (dependency of minsearch)
- pandas (dependency of minsearch)

## License

This project is for educational purposes as part of the AI Zoomcamp course.

## Acknowledgments

- Built with [FastMCP](https://github.com/jlowin/fastmcp)
- Search powered by [minsearch](https://github.com/alexeygrigorev/minsearch)
- Web scraping via [Jina Reader](https://jina.ai/reader/)
- Part of [DataTalks.Club AI Zoomcamp](https://datatalks.club)