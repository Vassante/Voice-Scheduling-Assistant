# Voice-Scheduling-Assistant
A Voice AI assistant to help you schedule meetings

## Deployed Link: 
[Test the Scheduling Agent Here](https://vapi.ai/?demo=true&shareKey=4cf33ecf-7b5e-4d58-a145-c8c79a55982d&assistantId=bf7df150-413b-4329-b9f4-40527caf78de)

## The Tech Stack:
    Voice Orchestration: VAPI
    LLM: Gemini-2.5-Flash
    Speech Synthesis: VAPI Voice (Optimized for <500ms latency)
    Automation Engine: n8n (Production Instance)
    Email Delivery: SendGrid API
    Calendar Logic: Custom Node.js / RFC 5545 (iCalendar)

## How to Test:
1. Open the link above and click the microphone icon to start the call.
2. Provide your Details: The agent will ask for your Name, Email, Preferred Date/Time, and Duration of the meeting.
3. Confirm the Details: Once you confirm the details, the agent will trigger a background workflow.
4. Check your Email: Within seconds, you will receive an email from vxk230045@utdallas.edu containing:
    - Direct Google Calendar and Outlook "Add" links.
    - A standards-compliant .ics attachment compatible with Apple Calendar and mobile devices.

## Calendar Integration Logic:
The core of this project lies in the transition from Voice Intent to Calendar Data.\
    **Tool Calling:** VAPI captures entities (Name, Email ID, Date, Time, Duration) and sends a JSON payload to a production n8n webhook.\
    **Data Processing:** A custom n8n Code Node parses the ISO-8601 strings. It accounts for timezones and calculates end-times based on the requested duration.\
    **ICS Generation:** To ensure universal compatibility, the system dynamically builds an RFC 5545 .ics file using CRLF line endings and the METHOD:REQUEST\ header. This allows the email to be recognized as a formal "Meeting Invite" by Gmail and Outlook.

## Proof of Concept:
- Live Event Creation Video: [View the Loom video here](https://www.loom.com/share/9a6de48b8e484dcfa078362be7eee051)
- **VAPI Execution Logs:** <img width="1854" height="1028" alt="execution_logs_vapi" src="https://github.com/user-attachments/assets/d4125bcf-5b73-408e-87f9-f2c05c226e1f" />
- **n8n Execution Logs:** <img width="1857" height="1030" alt="execution_logs_n8n" src="https://github.com/user-attachments/assets/426e1fd6-8d19-4dbc-97fb-54fad7896a10" />
- **SendGrid Execution Logs:** <img width="1856" height="1031" alt="execution_logs_sendgrid" src="https://github.com/user-attachments/assets/df1a295c-c2f7-43f0-b2c9-66bef0e9622c" />
- **n8n Workflow:** <img width="1858" height="1027" alt="workflow_n8n" src="https://github.com/user-attachments/assets/b29580c1-9218-4646-ac04-6524839ad31c" />
