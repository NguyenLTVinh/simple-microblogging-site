document.addEventListener("DOMContentLoaded", () => {
    const dateElements = document.querySelectorAll('.date-time');
    dateElements.forEach(element => {
        const date = new Date(element.textContent);
        element.textContent = `${date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true,
        })}`;
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

async function deleteComment(commentId) {
    try {
        const response = await fetch(`/api/comments/${commentId}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            document.querySelector(`#comment-${commentId}`).remove();
        } else {
            alert('Failed to delete comment');
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
    }
}

document.querySelector('#addCommentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const content = form.content.value;

    try {
        const response = await fetch(form.action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
        });

        if (response.ok) {
            location.reload();
        } else {
            alert('Failed to post comment');
        }
    } catch (error) {
        console.error('Error posting comment:', error);
    }
});
