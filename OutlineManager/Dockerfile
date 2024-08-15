FROM mcr.microsoft.com/dotnet/sdk:8.0-bookworm-slim AS build

# Install OpenSSL for certificate generation
RUN apt-get update && apt-get install -y openssl

# Generate and trust the developer certificate
RUN dotnet dev-certs https --clean
RUN dotnet dev-certs https -ep /root/.aspnet/https/aspnetapp.pfx -p password
RUN dotnet dev-certs https --trust

WORKDIR /sln

COPY ./OutlineManager.sln ./
COPY ./OutlineManager/*.csproj ./OutlineManager/

RUN dotnet restore

COPY . .

RUN dotnet build -c Release

FROM build AS publish
RUN dotnet publish ./OutlineManager/OutlineManager.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app
COPY --from=publish /app/publish .

# Copy the certificate to the final image
COPY --from=build /root/.aspnet/https /root/.aspnet/https

ENV ASPNETCORE_HTTP_PORTS=80
ENV ASPNETCORE_HTTPS_PORTS=443
EXPOSE 80
EXPOSE 443

# Set the environment variable for the certificate
ENV ASPNETCORE_Kestrel__Certificates__Default__Password=password
ENV ASPNETCORE_Kestrel__Certificates__Default__Path=/root/.aspnet/https/aspnetapp.pfx

ENTRYPOINT ["./OutlineManager"]
