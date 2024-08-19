# outline-config-server

Default domain
```bash
bash -c "$(wget -O /tmp/install.sh https://raw.githubusercontent.com/hamidmayeli/outline-config-server/main/install.sh && chmod +x /tmp/install.sh)" && /tmp/install.sh
```

Custom domain
```bash
bash -c "$(wget -O /tmp/install.sh https://raw.githubusercontent.com/hamidmayeli/outline-config-server/main/install.sh && chmod +x /tmp/install.sh)" && /tmp/install.sh --host yourdomain.com --email your@mail.com
```
