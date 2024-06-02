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
