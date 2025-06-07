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

    if (!name || !subject || !marksStr) {
        showAlert("Please fill in all the fields.");
        return;
    }
    const marks = Number(marksStr);
    if (isNaN(marks) || marks < 0 || marks > 100) {
        showAlert("Marks must be a number between 0 and 100.");
        return;
    }

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
            showAlert('Student updated!');
            var modalElement = document.getElementById('updateModal');
            var modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
        } else {
            showAlert('Update failed');
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

    if (!name || !subject || !marksStr) {
        showAlert("Please fill in all the fields.");
        return;
    }
    const marks = Number(marksStr);
    if (isNaN(marks) || marks < 0 || marks > 100) {
        showAlert("Marks must be a number between 0 and 100.");
        return;
    }

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
            let row = document.querySelector(`tr[data-id="${data.id}"]`);
            if (row) {
                row.querySelector('[data-field="marks"]').innerText = data.marks;
            } else {
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
                    showConfirm("Do you really want to remove this student permanently?").then(confirmed => {
                        if (!confirmed) return;
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
                                showAlert('Deletion failed');
                            }
                        });
                    });
                });
            }
            showAlert(`Student ${data.action} successfully!`).then(() => {
                var modalElement = document.getElementById('addModal');
                var modalInstance = bootstrap.Modal.getInstance(modalElement);
                modalInstance.hide();
            });
        } else {
            showAlert('Operation failed');
        }
    });
});

document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const row = this.closest('tr');
        const studentId = row.dataset.id;
        showConfirm("Do you really want to remove this student permanently?").then(confirmed => {
            if (!confirmed) return;
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
                    showAlert('Student deleted successfully');
                } else {
                    showAlert('Deletion failed');
                }
            });
        });
    });
});


function showConfirm(message) {
    return new Promise((resolve) => {
        const confirmModalEl = document.getElementById('confirmModal');
        confirmModalEl.querySelector('.modal-body').innerText = message;
        const confirmModal = new bootstrap.Modal(confirmModalEl);
        confirmModal.show();

        const confirmBtn = document.getElementById('confirm-btn');
        const cancelBtn = document.getElementById('cancel-btn');

        const onConfirm = () => {
            confirmModal.hide();
            cleanup();
            resolve(true);
        };
        const onCancel = () => {
            confirmModal.hide();
            cleanup();
            resolve(false);
        };

        function cleanup() {
            confirmBtn.removeEventListener('click', onConfirm);
            cancelBtn.removeEventListener('click', onCancel);
        }

        confirmBtn.addEventListener('click', onConfirm);
        cancelBtn.addEventListener('click', onCancel);
    });
}

function showAlert(message) {
    return new Promise(resolve => {
        const alertModalEl = document.getElementById('alertModal');
        alertModalEl.querySelector('.modal-body').innerText = message;
        const alertModal = new bootstrap.Modal(alertModalEl);
        alertModal.show();
        setTimeout(() => {
            alertModal.hide();
            resolve();
        }, 2000);
    });
}