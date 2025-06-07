document.querySelectorAll('.save-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const row = this.closest('tr');
        const id = row.dataset.id;
        const name = row.querySelector('[data-field="name"]').innerText.trim();
        const subject = row.querySelector('[data-field="subject"]').innerText.trim();
        const marks = row.querySelector('[data-field="marks"]').innerText.trim();

        // Pre-populate modal fields for update
        document.getElementById('student-id').value = id;
        document.getElementById('student-name').value = name;
        document.getElementById('student-subject').value = subject;
        document.getElementById('student-marks').value = marks;

        var updateModal = new bootstrap.Modal(document.getElementById('updateModal'));
        updateModal.show();
    });
});

document.getElementById('modal-save-btn').addEventListener('click', function() {
    const id = document.getElementById('student-id').value;
    const name = document.getElementById('student-name').value.trim();
    const subject = document.getElementById('student-subject').value.trim();
    const marksStr = document.getElementById('student-marks').value.trim();

    // Validation for update modal
    if (!name || !subject || !marksStr) {
        alert("Please fill in all the fields.");
        return;
    }
    const marks = Number(marksStr);
    if (isNaN(marks) || marks < 0 || marks > 100) {
        alert("Marks must be a number between 0 and 100.");
        return;
    }

    // Use updateStudentUrl for updating a student
    fetch(updateStudentUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": "{{ csrf_token }}"
        },
        body: JSON.stringify({ id, name, subject, marks })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            const row = document.querySelector(`tr[data-id="${id}"]`);
            row.querySelector('[data-field="name"]').innerText = name;
            row.querySelector('[data-field="subject"]').innerText = subject;
            row.querySelector('[data-field="marks"]').innerText = marks;
            alert('Student updated!');
            var modalElement = document.getElementById('updateModal');
            var modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
        } else {
            alert('Update failed');
        }
    });
});

document.getElementById('add-student-btn').addEventListener('click', function() {
    var addModal = new bootstrap.Modal(document.getElementById('addModal'));
    document.getElementById('add-form').reset();
    addModal.show();
});

document.getElementById('modal-add-btn').addEventListener('click', function() {
    const name = document.getElementById('add-student-name').value.trim();
    const subject = document.getElementById('add-student-subject').value.trim();
    const marksStr = document.getElementById('add-student-marks').value.trim();

    // Validation for add modal
    if (!name || !subject || !marksStr) {
        alert("Please fill in all the fields.");
        return;
    }
    const marks = Number(marksStr);
    if (isNaN(marks) || marks < 0 || marks > 100) {
        alert("Marks must be a number between 0 and 100.");
        return;
    }

    // Use addStudentUrl for adding a new student
    fetch(addStudentUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": "{{ csrf_token }}"
        },
        body: JSON.stringify({ name, subject, marks })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            // If student exists and is updated, find the row and update marks; else, add new row.
            let row = document.querySelector(`tr[data-id="${data.id}"]`);
            if (row) {
                // update existing row
                row.querySelector('[data-field="marks"]').innerText = data.marks;
            } else {
                // insert new row at the end
                const newRow = document.createElement('tr');
                newRow.setAttribute('data-id', data.id);
                newRow.innerHTML = `
                    <td contenteditable="false" class="editable" data-field="name">${data.name}</td>
                    <td contenteditable="false" class="editable" data-field="subject">${data.subject}</td>
                    <td contenteditable="false" class="editable" data-field="marks">${data.marks}</td>
                    <td>
                        <button class="btn btn-sm btn-primary save-btn">Update</button>
                        <button class="btn btn-sm btn-danger delete-btn">Delete</button>
                    </td>
                `;
                document.querySelector('#students-table tbody').appendChild(newRow);
                // Add event listeners for newly added buttons
                newRow.querySelector('.save-btn').addEventListener('click', function () {
                    const row = this.closest('tr');
                    const id = row.dataset.id;
                    const name = row.querySelector('[data-field="name"]').innerText.trim();
                    const subject = row.querySelector('[data-field="subject"]').innerText.trim();
                    const marks = row.querySelector('[data-field="marks"]').innerText.trim();
                    document.getElementById('student-id').value = id;
                    document.getElementById('student-name').value = name;
                    document.getElementById('student-subject').value = subject;
                    document.getElementById('student-marks').value = marks;
                    var updateModal = new bootstrap.Modal(document.getElementById('updateModal'));
                    updateModal.show();
                });
                newRow.querySelector('.delete-btn').addEventListener('click', function () {
                    const row = this.closest('tr');
                    const studentId = row.dataset.id;
                    if (!confirm("Are you sure you want to delete this student?")) {
                        return;
                    }
                    fetch(`/delete-student/${studentId}/`, {
                        method: "POST",
                        headers: {
                            "X-CSRFToken": "{{ csrf_token }}"
                        }
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.status === 'deleted') {
                            row.remove();
                        } else {
                            alert('Deletion failed');
                        }
                    });
                });
            }
            alert(`Student ${data.action} successfully!`);
            var modalElement = document.getElementById('addModal');
            var modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
        } else {
            alert('Operation failed');
        }
    });
});

document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const row = this.closest('tr');
        const studentId = row.dataset.id;
        if (!confirm("Are you sure you want to delete this student?")) {
            return;
        }
        fetch(`/delete-student/${studentId}/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": "{{ csrf_token }}"
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'deleted') {
                row.remove();
            } else {
                alert('Deletion failed');
            }
        });
    });
});