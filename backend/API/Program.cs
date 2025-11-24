using API;
using API.Extensions;
using API.Settings;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.AddConsole();

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services
    .AddEndpointsApiExplorer()
    .AddSwaggerGen(option =>
    {
        option.SwaggerDoc("v1", new OpenApiInfo { Title = "Demo API", Version = "v1" });
        option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            In = ParameterLocation.Header,
            Description = "Please enter a valid token",
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            BearerFormat = "JWT",
            Scheme = "Bearer"
        });

        option.AddSecurityRequirement((document) => new OpenApiSecurityRequirement()
        {
            [new OpenApiSecuritySchemeReference("Bearer", document)] = []
        });
    })
    .AddApiVersioning(setup =>
    {
        setup.ReportApiVersions = true;
    });

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        var secret = builder.Configuration.GetValue<string>("Authentication:Secret")
            ?? throw new MissingSettingException("Authentication:Secret");
        var key = Encoding.ASCII.GetBytes(secret!);

        var issuer = builder.Configuration.GetValue<string>("Authentication:Issuer")
            ?? throw new MissingSettingException("Authentication:Issuer");

        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = issuer,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<API.Services.UserService>>();

                logger.LogError(context.Exception, "========== Authentication failed {message}", context.Exception.Message);

                return Task.CompletedTask;
            }
        };
    });

builder.Services
    .AddDb()
    .AddProjectServices();

builder.Services.Configure<AuthenticationSettings>(
    options => builder.Configuration.GetSection("Authentication").Bind(options));

builder.Services.Configure<ReportSettings>(
    options => builder.Configuration.GetSection("Report").Bind(options));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllPolicy",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });

    if( builder.Environment.IsDevelopment())
        options.AddDefaultPolicy(policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
    else
        options.AddDefaultPolicy(policy =>
        {
            var origins = builder.Configuration.GetValue("ALLOWEDHOSTS", "*")!;

            policy.WithOrigins(origins.Split(","))
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseDefaultFiles();
    app.UseStaticFiles();
}

app.UseHttpsRedirection();

app.UseCors();

app
    .UseAuthentication()
    .UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("/index.html");

app.Run();
