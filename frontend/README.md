# Frontend

This directory contains the **Mercury web frontend**.  
It provides a user interface for interacting with the Mercury backend API —  
including viewing scanned emails, user management, and status dashboards.

## Tech stack
- React (or Next.js)
- Tailwind CSS (for styling)
- Axios (for API communication)

## Development
```bash
# run locally (example)
npm install
npm run dev
````

When using Docker:

```bash
docker-compose up frontend
```

The frontend will be available at **[http://localhost:3000](http://localhost:3000)**
and communicates with the backend API at **[http://localhost:8000/api/](http://localhost:8000/api/)**.
