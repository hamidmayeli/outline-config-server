# outline-config-server

Article for [testing](https://medium.com/younited-tech-blog/end-to-end-test-a-blazor-app-with-playwright-part-1-224e8894c0f3)

Default domain
```bash
sudo bash -c "$(wget -qO- https://raw.githubusercontent.com/hamidmayeli/outline-config-server/main/install.sh | tee /tmp/install.sh | chmod +x /tmp/install.sh)" && /tmp/install.sh --host yourdomain.com
```

Custom domain
```bash
sudo bash -c "$(wget -qO- https://raw.githubusercontent.com/hamidmayeli/outline-config-server/main/install.sh | tee /tmp/install.sh | chmod +x /tmp/install.sh)" && /tmp/install.sh --host yourdomain.com
```
