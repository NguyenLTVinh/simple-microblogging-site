document.addEventListener("DOMContentLoaded", () => {
    setInterval(updateLikeCounts, 500);
});

function goToPost(postId) {
    window.location.href = `/post/${postId}`;
}

async function likePost(postId) {
    try {
        await fetch(`/like-post/${postId}`, { method: 'POST' });
    } catch (err) {
        console.error('Error:', err);
    }
}

async function updateLikeCounts() {
    try {
        const response = await fetch('/api/like-counts');
        const likeCounts = await response.json();

        for (const postId in likeCounts) {
            const likeCountElement = document.getElementById(`like-count-${postId}`);
            if (likeCountElement) {
                likeCountElement.innerText = likeCounts[postId];
            }
        }
    } catch (err) {
        console.error(err);
    }
}