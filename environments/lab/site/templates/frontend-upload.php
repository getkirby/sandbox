<h1>Frontend Upload</h1>

<form>
	<input type="file" name="files">
	<button>Upload</button>
</form>

<h2>Uploads</h2>
<ul>
	<?php foreach ($page->files() as $upload): ?>
		<li><?= $upload->filename() ?></li>
	<?php endforeach; ?>
</ul>

<script>

document.querySelector('form').addEventListener('submit', (e) => {
	e.preventDefault();

	let formData = new FormData(e.target);

	// We can now send the POT request
	fetch('/uploads', {
		method : 'POST',
		body   : formData
	})
	.then(response => response.json())
	.then(data => {
		console.log('Upload successful:', data);
		window.location.reload();
	})
	.catch(error => {
		console.error('Upload error:', error);
		alert('Upload failed');
	});
});
</script>
