function deletePost(postId) {
    fetch(`/post/${postId}`, { method: 'DELETE' })
        .then(response => {
            if (response.ok) {
                window.location.href = '/'; // Redirect to the main page
            } else {
                throw new Error('Failed to delete post');
            }
        })
        .catch(err => console.error('Error:', err));
}
