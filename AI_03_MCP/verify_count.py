import requests
import re

def get_page_markdown(url: str) -> str:
    """Get content of any webpage in markdown format using Jina reader."""
    jina_url = f"https://r.jina.ai/{url}"
    response = requests.get(jina_url)
    response.raise_for_status()
    return response.text

if __name__ == "__main__":
    url = "https://datatalks.club/"
    print(f"Fetching content from: {url}\n")
    
    content = get_page_markdown(url)
    
    # Find all matches with context
    pattern = r'\b(data)\b'
    matches = [(m.start(), m.group()) for m in re.finditer(pattern, content, re.IGNORECASE)]
    
    print(f"Found {len(matches)} occurrences of 'data':\n")
    
    for i, (pos, match) in enumerate(matches, 1):
        # Get context around each match (50 chars before and after)
        start = max(0, pos - 50)
        end = min(len(content), pos + len(match) + 50)
        context = content[start:end]
        
        # Replace newlines with spaces for readability
        context = ' '.join(context.split())
        
        print(f"{i}. ...{context}...")
        print()
