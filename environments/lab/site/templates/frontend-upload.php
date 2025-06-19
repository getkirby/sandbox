<!doctype html>

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

<script type="module">
document.querySelector('form').addEventListener('submit', async (e) => {
	e.preventDefault();

	let formData = new FormData(e.target);

	// We can now send the POST request
	try {
		const response = await fetch('/uploads', {
			method : 'POST',
			body   : formData
		})

		const data = await response.json();

		if (data.status === 'error') {
			throw new Error(data.message);
		}

		console.log('Upload successful:', data.filename);
		window.location.reload();
	} catch (error) {
		console.error('Upload error:', error);
		alert(error.message);
	}
});
</script>
