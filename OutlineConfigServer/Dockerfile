FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
# Install clang/zlib1g-dev dependencies for publishing to native
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    clang zlib1g-dev
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["OutlineConfigServer.csproj", "."]
RUN dotnet restore "./OutlineConfigServer.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "./OutlineConfigServer.csproj" -c $BUILD_CONFIGURATION -o /app/build

RUN dotnet publish "./OutlineConfigServer.csproj" -c $BUILD_CONFIGURATION -o /app/publish -r linux-x64 --self-contained
RUN ls /app/publish

FROM ubuntu AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80
COPY --from=build /app/publish .
ENTRYPOINT ["./OutlineConfigServer"]
