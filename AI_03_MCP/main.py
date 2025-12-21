from fastmcp import FastMCP
import requests
import re
from search import extract_md_files, create_search_index, search

mcp = FastMCP("Demo 🚀")

# Initialize the documentation search index
print("Loading documentation index...")
docs = extract_md_files("fastmcp-main.zip")
doc_index = create_search_index(docs)
print(f"✓ Loaded {len(docs)} documentation files")

@mcp.tool
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

@mcp.tool
def get_page_markdown(url: str) -> str:
    """
    Get content of any webpage in markdown format using Jina reader.
    
    Args:
        url: The URL of the webpage to fetch (e.g., https://datatalks.club)
    
    Returns:
        The webpage content in markdown format
    """
    jina_url = f"https://r.jina.ai/{url}"
    response = requests.get(jina_url)
    response.raise_for_status()
    return response.text

@mcp.tool
def count_word_in_page(url: str, word: str) -> str:
    """
    Count how many times a specific word appears on a webpage.
    
    Args:
        url: The URL of the webpage to analyze (e.g., https://datatalks.club)
        word: The word to count (case-insensitive)
    
    Returns:
        A message with the count result
    """
    jina_url = f"https://r.jina.ai/{url}"
    response = requests.get(jina_url)
    response.raise_for_status()
    content = response.text
    
    # Count word occurrences (case-insensitive, whole word match)
    count = len(re.findall(rf'\b{word}\b', content, re.IGNORECASE))
    
    return f"The word '{word}' appears {count} times on {url}"

@mcp.tool
def search_documentation(query: str, num_results: int = 5) -> str:
    """
    Search the FastMCP documentation for relevant information.
    
    Args:
        query: The search query (e.g., "how to create a tool", "installation")
        num_results: Number of results to return (default: 5, max: 10)
    
    Returns:
        Formatted search results with filenames and content previews
    """
    # Limit num_results to max 10
    num_results = min(num_results, 10)
    
    results = search(doc_index, query, num_results=num_results)
    
    if not results:
        return f"No results found for query: '{query}'"
    
    # Format the results
    output = [f"Found {len(results)} results for '{query}':\n"]
    
    for i, result in enumerate(results, 1):
        filename = result['filename']
        content = result['content']
        
        # Get first 200 characters as preview
        preview = content[:200].replace('\n', ' ').strip()
        if len(content) > 200:
            preview += "..."
        
        output.append(f"{i}. {filename}")
        output.append(f"   {preview}\n")
    
    return "\n".join(output)

if __name__ == "__main__":
    mcp.run()