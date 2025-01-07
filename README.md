# Versetul Zilei WhatsApp Bot

This project automatically sends daily Bible verses to a WhatsApp group using Cloudflare Workers and the [WhatsApp HTTP API](https://waha.devlike.pro/docs/overview/quick-start/).

## Features

- Daily scheduled delivery of Bible verses
- Typing indicators simulation (can be disabled)
- Romanian date formatting
- Basic authentication for API endpoints

## WAHA Configuration

To get your WhatsApp Chat ID and configure WAHA:

1. Install Docker if not already installed:
   ```bash
   # For macOS (with Homebrew):
   brew install --cask docker

   # Start Docker Desktop
   open -a Docker
   ```

2. Download and run WAHA:
   ```bash
   docker-compose up
   ```

3. Open the WAHA dashboard:
   ```bash
   open http://localhost:3000/dashboard
   ```
   - default credentials: `dev` / `dev-password`

4. In the dashboard:
   - Start a new session (leave settings as default)
   - Scan the QR code with your WhatsApp mobile app
   - Wait for status to change to "WORKING"

5. To get your group chat ID:
   - Open the group in WhatsApp
   - Click the group name to view group info
   - Scroll to the bottom to find the group invite link
   - The chat ID is the part after https://chat.whatsapp.com/
   - Format it as: 120363367569467119@g.us

6. Add the chat ID to your .env file:
   ```bash
   WHATSAPP_CHAT_ID="your-group-id@g.us"
   ```

## Development Setup

### Prerequisites

1. Node.js (v18 or higher)
2. npm or yarn
3. Cloudflare Workers CLI (wrangler)
4. WhatsApp HTTP API instance

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/radio-crestin/versetul-zilei-whatsapp.git
   cd versetul-zilei-whatsapp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` and `.dev.vars`
   - Copy `.dev.vars.example` to `.dev.vars`
   - Update the values with your actual credentials

   Example `.env` file:
   ```bash
   WHATSAPP_API_URL="http://localhost:3000"
   WHATSAPP_CHAT_ID="120363367569467119@g.us"
   WHATSAPP_SESSION="default"
   WHATSAPP_AUTH_USER="dev"
   WHATSAPP_AUTH_PASS="dev-password"
   WHATSAPP_GROUP_URL="https://chat.whatsapp.com/Fpezp7iQlxT2oexlxs3kN4"
   ```

4. Start local development server:
   ```bash
   npm run dev
   ```

## Deployment to Cloudflare Workers

1. Install Wrangler CLI if not already installed:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Update `wrangler.toml` with your Cloudflare account details

4. Deploy to Cloudflare Workers:
   ```bash
   wrangler deploy
   ```

## Configuration

### Environment Variables

| Variable               | Description                                      | Example Value                                      |
|------------------------|--------------------------------------------------|----------------------------------------------------|
| WHATSAPP_API_URL       | URL of your WhatsApp HTTP API instance           | `http://localhost:3000`                           |
| WHATSAPP_CHAT_ID       | WhatsApp group chat ID                           | `120363367569467119@g.us`                         |
| WHATSAPP_SESSION       | WhatsApp session name                            | `default`                                         |
| WHATSAPP_AUTH_USER     | Basic auth username for WhatsApp API             | `dev`                                             |
| WHATSAPP_AUTH_PASS     | Basic auth password for WhatsApp API             | `dev-password`                                    |
| WHATSAPP_GROUP_URL     | URL of the WhatsApp group                        | `https://chat.whatsapp.com/Fpezp7iQlxT2oexlxs3kN4`|

### Scheduled Events

The worker is configured to run daily at 5:30 AM UTC (7:30 AM Romania time) via the cron trigger in `wrangler.toml`.

## API Endpoints

- `GET /` - Redirects to WhatsApp group URL
- `GET /send-daily-verse` - Manually trigger verse sending
  - Optional query parameter: `?typing=false` to disable typing indicators
- `GET /__scheduled` - Internal endpoint for scheduled events

## Testing

To manually test the verse sending:
```bash
curl "http://localhost:8787/send-daily-verse"
```

To test without typing indicators:
```bash
curl "http://localhost:8787/send-daily-verse?typing=false"
```

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a new Pull Request

## License

MIT License

## Support

For support or feature requests, please open an issue on GitHub.
