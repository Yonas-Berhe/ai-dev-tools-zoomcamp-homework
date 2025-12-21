import requests
import re

def get_page_markdown(url: str) -> str:
    """Get content of any webpage in markdown format using Jina reader."""
    jina_url = f"https://r.jina.ai/{url}"
    response = requests.get(jina_url)
    response.raise_for_status()
    return response.text

def count_word(text: str, word: str) -> int:
    """Count occurrences of a word (case-insensitive)."""
    return len(re.findall(rf'\b{word}\b', text, re.IGNORECASE))

if __name__ == "__main__":
    url = "https://datatalks.club/"
    print(f"Fetching content from: {url}")
    
    content = get_page_markdown(url)
    data_count = count_word(content, "data")
    
    print(f"\n✓ The word 'data' appears {data_count} times on {url}")
