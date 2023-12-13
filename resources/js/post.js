document.addEventListener("DOMContentLoaded", () => {
    // Formatting the time
    var dateElements = document.querySelectorAll('.date-time');
    dateElements.forEach(function (element) {
        var date = new Date(element.textContent);
        element.textContent = date.toLocaleString();
    });
});

function deletePost(postId) {
    fetch(`/api/post/${postId}`, { method: 'DELETE' })
        .then(response => {
            if (response.ok) {
                window.location.href = '/'; // Redirect to the main page
            } else {
                throw new Error('Failed to delete post');
            }
        })
        .catch(err => console.error('Error:', err));
}
