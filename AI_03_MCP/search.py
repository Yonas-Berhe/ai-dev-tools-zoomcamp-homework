import zipfile
from pathlib import Path
from minsearch import Index

def extract_md_files(zip_path: str) -> list[dict]:
    """
    Extract .md and .mdx files from a zip archive.
    
    Args:
        zip_path: Path to the zip file
    
    Returns:
        List of dictionaries with 'filename' and 'content' fields
    """
    documents = []
    
    with zipfile.ZipFile(zip_path, 'r') as zip_file:
        for file_info in zip_file.namelist():
            # Check if file is .md or .mdx
            if file_info.endswith('.md') or file_info.endswith('.mdx'):
                # Read the file content
                with zip_file.open(file_info) as f:
                    content = f.read().decode('utf-8', errors='ignore')
                
                # Remove the first part of the path (e.g., "fastmcp-main/")
                # Split by first slash and join the rest
                parts = file_info.split('/', 1)
                if len(parts) > 1:
                    cleaned_filename = parts[1]
                else:
                    cleaned_filename = file_info
                
                documents.append({
                    'filename': cleaned_filename,
                    'content': content
                })
    
    return documents

def create_search_index(documents: list[dict]) -> Index:
    """
    Create and fit a minsearch index with the documents.
    
    Args:
        documents: List of dictionaries with 'filename' and 'content' fields
    
    Returns:
        Fitted minsearch Index
    """
    # Create index with content as text field and filename as keyword field
    index = Index(
        text_fields=['content', 'filename'],
        keyword_fields=[]
    )
    
    # Fit the index with documents
    index.fit(documents)
    
    return index

def search(index: Index, query: str, num_results: int = 5) -> list[dict]:
    """
    Search the index and retrieve the most relevant documents.
    
    Args:
        index: The fitted minsearch Index
        query: Search query string
        num_results: Number of results to return (default: 5)
    
    Returns:
        List of the most relevant documents
    """
    # Boost content field more than filename
    boost_dict = {
        'content': 1.0,
        'filename': 2.0  # Boost filename matches
    }
    
    results = index.search(
        query=query,
        boost_dict=boost_dict,
        num_results=num_results
    )
    
    return results

if __name__ == "__main__":
    # Path to the downloaded zip file
    zip_path = "fastmcp-main.zip"
    
    print("Extracting markdown files from zip...")
    documents = extract_md_files(zip_path)
    print(f"✓ Extracted {len(documents)} markdown files")
    
    print("\nSample documents:")
    for doc in documents[:3]:
        print(f"  - {doc['filename']} ({len(doc['content'])} chars)")
    
    print("\nCreating search index...")
    index = create_search_index(documents)
    print("✓ Index created and fitted")
    
    # Test searches
    test_queries = [
        "how to create a tool",
        "installation",
        "server configuration"
    ]
    
    print("\n" + "=" * 60)
    print("Testing search functionality")
    print("=" * 60)
    
    for query in test_queries:
        print(f"\nQuery: '{query}'")
        print("-" * 60)
        results = search(index, query, num_results=5)
        
        for i, result in enumerate(results, 1):
            print(f"{i}. {result['filename']}")
            # Print first 100 chars of content
            content_preview = result['content'][:100].replace('\n', ' ')
            print(f"   {content_preview}...")
