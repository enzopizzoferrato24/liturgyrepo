# Liturgical Commentary Index — Static Website

This project is a fully static, searchable, and interactive website for browsing the Liturgical Commentary Index, based on the Vogel Index. It is built with vanilla HTML, CSS, and JavaScript, and it is designed to be hosted for free on **GitHub Pages**.

---

## Features

- **Fully Static:** No backend or database required. Runs in any modern browser.
- **Search & Filter:** Instant client-side search and multi-field filtering on the full 318-entry dataset.
- **Interactive Map:** A Leaflet.js map plots all 102 entries with geographic coordinates, featuring a century-by-century slider to visualize the data over time.
- **Submission Form:** A form for users to submit new entries. It uses the free [Formspree.io](https://formspree.io/) service to forward submissions to your email.
- **Responsive Design:** A clean, scholarly aesthetic that works on desktop and mobile devices.

---

## How to Deploy to GitHub Pages (Free Hosting)

Follow these steps to get your website live in under 5 minutes.

### Step 1: Create a GitHub Repository

1.  Go to [github.com/new](https://github.com/new).
2.  Name your repository (e.g., `liturgical-index`).
3.  Make sure it is set to **Public**.
4.  Click **Create repository**.

### Step 2: Upload the Website Files

1.  In your new GitHub repository, click the **Add file** button and choose **Upload files**.
2.  Drag and drop all the files and folders from the `liturgical-site` directory (the contents of the `.zip` archive) into the upload area.
3.  Click **Commit changes**.

### Step 3: Enable GitHub Pages

1.  In your repository, go to the **Settings** tab.
2.  In the left sidebar, click on **Pages**.
3.  Under "Branch", select `main` (or `master`) and `/ (root)` folder, then click **Save**.
4.  GitHub will generate your site and provide you with the public URL (e.g., `https://YOUR_USERNAME.github.io/liturgical-index/`). It may take a minute or two to become active.

### Step 4: Configure the Submission Form (Optional)

To receive submissions from the "Submit Entry" page, you need to link it to a free Formspree form.

1.  Go to [formspree.io/create/t](https://formspree.io/create/t) and enter your email address.
2.  Click **Create Form**.
3.  Formspree will give you a unique URL endpoint that looks like `https://formspree.io/f/xxxxxxxx`.
4.  Open the `index.html` file in your GitHub repository.
5.  Click the pencil icon to **Edit** the file.
6.  Find the line (around line 300) that looks like this:

    ```html
    <form id="submit-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
    ```

7.  Replace `YOUR_FORM_ID` with your unique ID from Formspree.
8.  Click **Commit changes**.

That’s it! Your website is now live and ready to accept submissions.

---

## Local Development

To run this website locally, you don’t need any special tools. Simply open the `index.html` file in your web browser.

Note that some browsers may restrict loading JSON data from local files. For the best experience, run a simple local server:

```bash
# Navigate to the liturgical-site directory
cd /path/to/liturgical-site

# Run a simple Python web server
python3 -m http.server
```

Then open `http://localhost:8000` in your browser.
