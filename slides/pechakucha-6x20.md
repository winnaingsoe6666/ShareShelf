---
marp: true
theme: default
paginate: true
---

# ShareShelf AI Integration
Adding MCP, Skills, and Agents
Student: winnaingsoe6666
Date: 2026-06-16

---

# What is ShareShelf?
- Community-powered tool library
- Built with Spring Boot & Kotlin
- Next.js 15 frontend
- PostgreSQL database

---

# MCP Integration
- Server: `shareshelf-db`
- Connects directly to the PostgreSQL database
- Enables AI to read schemas and query data

---

# Skill: analyze-shareshelf-db
- Guides AI on how to interact with the database safely
- Prevents destructive operations by default
- Focuses on read-only debugging and data inspection

---

# Agent: db-assistant
- Role: Database Administrator
- Uses the MCP server and skill
- Helps write and optimize repository queries

---

# Conclusion
- AI tools deeply integrated into the workflow
- Safer database interactions
- Faster debugging and development
