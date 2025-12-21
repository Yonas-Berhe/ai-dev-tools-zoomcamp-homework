#!/usr/bin/env python3
"""Test the search_documentation tool"""

from search import extract_md_files, create_search_index, search

# Load the index
print("Loading documentation index...")
docs = extract_md_files("fastmcp-main.zip")
doc_index = create_search_index(docs)
print(f"✓ Loaded {len(docs)} documentation files\n")

# Test the search functionality
def search_documentation(query: str, num_results: int = 5) -> str:
    """Search the FastMCP documentation for relevant information."""
    num_results = min(num_results, 10)
    
    results = search(doc_index, query, num_results=num_results)
    
    if not results:
        return f"No results found for query: '{query}'"
    
    output = [f"Found {len(results)} results for '{query}':\n"]
    
    for i, result in enumerate(results, 1):
        filename = result['filename']
        content = result['content']
        
        preview = content[:200].replace('\n', ' ').strip()
        if len(content) > 200:
            preview += "..."
        
        output.append(f"{i}. {filename}")
        output.append(f"   {preview}\n")
    
    return "\n".join(output)

# Test queries
test_queries = ["demo", "installation", "create tool"]

for query in test_queries:
    print("=" * 70)
    result = search_documentation(query, num_results=3)
    print(result)
    print()
