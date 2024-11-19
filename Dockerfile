FROM mcr.microsoft.com/dotnet/sdk:9.0-bookworm-slim AS build

# Install OpenSSL for certificate generation
RUN apt-get update && apt-get install -y openssl

# Generate and trust the developer certificate
RUN dotnet dev-certs https --clean
RUN mkdir -p /root/.aspnet/https/
RUN dotnet dev-certs https -ep /root/.aspnet/https/aspnetapp.pfx -p password
RUN dotnet dev-certs https --trust

WORKDIR /sln

COPY ./backend/API.sln ./
COPY ./backend/API/*.csproj ./API/
COPY ./backend/API.Tests/*.csproj ./API.Tests/

RUN dotnet restore

COPY ./backend .

RUN dotnet build -c Release

FROM build AS publish
RUN dotnet publish ./API/API.csproj -c Release -o /app/publish

FROM build AS test-api
WORKDIR /sln
RUN dotnet test ./API.sln

# ============== Build Client  ============== 
FROM node:22.11.0-slim AS build-client

RUN apt-get update && apt-get install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb jq -y

WORKDIR /app

COPY ./frontend/package*.json ./
RUN npm ci

COPY ./frontend .
# RUN npm run lint && npm run build
RUN npm run build

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final

WORKDIR /app
COPY --from=publish /app/publish .
COPY --from=build-client /app/dist ./wwwroot

# Copy the certificate to the final image
COPY --from=build /root/.aspnet/https /root/.aspnet/https

ENV ASPNETCORE_HTTP_PORTS=80
ENV ASPNETCORE_HTTPS_PORTS=443
EXPOSE 80
EXPOSE 443

# Set the environment variable for the certificate
# ENV ASPNETCORE_Kestrel__Certificates__Default__Password=password
# ENV ASPNETCORE_Kestrel__Certificates__Default__Path=/root/.aspnet/https/aspnetapp.pfx

ENTRYPOINT ["./API"]
