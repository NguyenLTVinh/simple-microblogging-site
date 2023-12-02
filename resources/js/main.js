function goToPost(postId) {
    window.location.href = `/post/${postId}`;
}

async function likePost(postId) {
    try {
        const response = await fetch(`/like-post/${postId}`, { method: 'POST' });
        const data = await response.json();

        if (data.like_count !== undefined) {
            document.getElementById(`like-count-${postId}`).innerText = data.like_count;
        }
    } catch (err) {
        console.error('Error:', err);
    }
}