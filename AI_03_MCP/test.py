import requests

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

if __name__ == "__main__":
    # Test with GitHub repo URL
    test_url = "https://github.com/alexeygrigorev/minsearch"
    print(f"Fetching markdown content for: {test_url}")
    print("=" * 60)
    
    try:
        content = get_page_markdown(test_url)
        print(content[:1000])  # Print first 1000 characters
        print("\n" + "=" * 60)
        print(f"✓ Successfully fetched {len(content)} characters")
    except Exception as e:
        print(f"✗ Error: {e}")
