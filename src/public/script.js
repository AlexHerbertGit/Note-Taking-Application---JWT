//Functions for UI interaction

document.addEventListener('DOMContentLoaded', function() {
    // Function to execute commands for text formatting
    function execCmd(command) {
        document.execCommand(command, false, null);
    }

    // Event listener for the sidebar toggle button
    document.getElementById('sidebarToggle').addEventListener('click', function() {
        var sidebar = document.getElementById('sidebarMenu');
        if (sidebar.classList.contains('d-none')) {
            sidebar.classList.remove('d-none');
            sidebar.classList.add('d-block');
        } else {
            sidebar.classList.remove('d-block');
            sidebar.classList.add('d-none');
        }
    });
});

//Event Listener for form (note) submission
document.getElementById('noteForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get form values
    const noteId = document.getElementById('noteId').value; // Get the hidden noteId field value
    const title = document.getElementById('noteTitle').value;
    const date = document.getElementById('noteDate').value;
    const content = document.getElementById('noteContent').innerHTML;

    // Create the note object
    const note = { title, date, content };

    try {
        let response;
        if (noteId) {
            // Update existing note
            response = await fetch(`http://localhost:5000/api/notes/${noteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(note),
            });
        } else {
            // Create new note
            response = await fetch('http://localhost:5000/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(note),
            });
        }

        if (response.ok) {
            const result = await response.json();
            console.log('Note saved:', result);

            // Optionally, clear the form after submission
            document.getElementById('noteForm').reset();
            document.getElementById('noteContent').innerHTML = '';

            // Fetch and display the updated notes
            fetchNotes();
        } else {
            console.error('Failed to save the note');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});


// Fetch and display note titles in the sidebar
async function fetchNotes() {
    try {
        const response = await fetch('http://localhost:5000/api/notes');
        const notes = await response.json();

        const notesList = document.getElementById('notesList');
        notesList.innerHTML = '';

        notes.forEach(note => {
            const noteItem = document.createElement('li');
            noteItem.classList.add('nav-item');
            noteItem.innerHTML = `
                <a class="nav-link note-title" href="#" data-id="${note._id}">
                    ${note.title}
                </a>
            `;
            notesList.appendChild(noteItem);
        });

        // Add event listeners for note titles
        document.querySelectorAll('.note-title').forEach(link => {
            link.addEventListener('click', loadNote);
        });
    } catch (error) {
        console.error('Error fetching notes:', error);
    }
}

// Load note into the form
async function loadNote(event) {
    event.preventDefault();

    const noteId = this.getAttribute('data-id');

    try {
        const response = await fetch(`http://localhost:5000/api/notes/${noteId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const note = await response.json();

        // Populate the form with the note data
        document.getElementById('noteId').value = note._id;
        document.getElementById('noteTitle').value = note.title;
        document.getElementById('noteDate').value = note.date;
        document.getElementById('noteContent').innerHTML = note.content;
    } catch (error) {
        console.error('Error loading note:', error);
    }
}

// Fetch notes on page load
fetchNotes();


//Delete note functionality
document.getElementById('deleteButton').addEventListener('click', async function() {
    const noteId = document.getElementById('noteId').value; // Get the hidden noteId field value

    if (noteId) {
        try {
            const response = await fetch(`http://localhost:5000/api/notes/${noteId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                console.log('Note deleted');

                // Optionally, clear the form after deletion
                document.getElementById('noteForm').reset();
                document.getElementById('noteContent').innerHTML = '';
                document.getElementById('noteId').value = ''; // Clear the hidden noteId field

                // Fetch and display the updated notes
                fetchNotes();
            } else {
                console.error('Failed to delete the note');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        console.error('No note selected to delete');
    }
});
