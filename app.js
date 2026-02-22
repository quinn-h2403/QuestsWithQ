// Configuration
const postsManifestPath = 'posts.json';

// Fetch and render the single post based on URL slug
async function loadPost() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const postContainer = document.getElementById('post-container');

    if (!slug) {
        postContainer.innerHTML = '<h1>Post not found</h1><p>Returning <a href="index.html">home</a>.</p>';
        return;
    }

    try {
        const response = await fetch(`posts/${slug}.md`);
        if (!response.ok) throw new Error('Post not found');

        const markdown = await response.text();
        postContainer.innerHTML = marked.parse(markdown);

        // Update page title if possible (extract first H1)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = postContainer.innerHTML;
        const h1 = tempDiv.querySelector('h1');
        if (h1) document.title = h1.innerText + ' - QuestsWithQ';

    } catch (error) {
        postContainer.innerHTML = '<h1>Adventure Missing</h1><p>We couldn\'t find that post. <a href="index.html">Back to adventures</a>.</p>';
        console.error(error);
    }
}

// Fetch and render the list of posts for the index page
async function loadIndex() {
    const postList = document.getElementById('post-list');
    if (!postList) return;

    // Detect if we are running locally via file:// protocol
    const isLocalFile = window.location.protocol === 'file:';

    try {
        const response = await fetch(postsManifestPath);
        if (!response.ok) throw new Error('Could not fetch manifest');

        const posts = await response.json();

        // Only overwrite if we successfully got posts
        if (posts && posts.length > 0) {
            postList.innerHTML = posts.map(post => `
                <a href="post.html?slug=${post.slug}" class="post-card">
                    <div class="post-meta">${post.date} &bull; ${post.category || 'Travel'}</div>
                    <h2>${post.title}</h2>
                    <p class="post-excerpt">${post.excerpt}</p>
                </a>
            `).join('');
        }

    } catch (error) {
        console.warn('Note: Dynamic directory listing requires a local server (like Live Server or http-server). Using static fallback links.');
        console.error('Fetch error:', error);

        // If we are on file:// and fetch failed, we don't clear the list 
        // We let the static HTML from index.html stay visible.
    }
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('post.html')) {
        loadPost();
    } else {
        loadIndex();
    }
});
