# \# Tech Selector Artifact
# This repository contains the artifact associated with the technology selection methodology described in:
# DATI TESI
# The artifact provides a browser-based implementation of the requirement-driven evaluation workflow
#It allows users to inspect the criteria, review the requirement elicitation questions, inspect the technology profiles, and compute compatibility rankings across the considered technologies.
#
# \## Repository structure
# \- `index.html` — entry page.
# \- `criteria.html` — criteria definitions and level parameterization.
# \- `questions.html` — requirement elicitation questions.
# \- `technologies.html` — technology profile inspection.
# \- `run.html` — ranking computation and visual comparison.
# \- `heatmap.html` — per-criterion compatibility matrix.
# \- `app/` — JavaScript modules used by the interface.
# \- `data/` — criteria, questions, and technology profiles.
# \- `styles.css` — interface styling.
#
# \## Running locally
# The artifact is static and does not require a backend server.  
# Because the application loads JSON files with `fetch`, it should be served through a local HTTP server rather than opened directly from the filesystem.
#
#Using Python:
# \## bash:
# python -m http.server 8000

