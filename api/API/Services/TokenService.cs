using API.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace API.Services
{
    public class TokenService
    {
        public string GenerateToken(User user)
        {
            var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("superSecretKey@345"));
            var signinCredentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);
            List<Claim> claims = new List<Claim> {
                new Claim("id", user.Id.ToString()),
                new Claim("email", user.Email!),
                new Claim("firstname", user.FName!),
                new Claim("lastname", user.LName!),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var tokeOptions = new JwtSecurityToken(
                issuer: "https://localhost:5001",
                audience: "https://localhost:5001",
                expires: DateTime.Now.AddMinutes(120),
                claims: claims,
                signingCredentials: signinCredentials
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(tokeOptions);

            return tokenString;
        }

        public JwtSecurityToken GetToken(HttpRequest request)
        {
            request.Headers.TryGetValue("authorization", out var token);
            string jwtTokenString = token.ToString().Replace("Bearer ", "");
            return new JwtSecurityToken(jwtTokenString);
        }
        public string GetData(JwtSecurityToken jwtToken, string key)
        {
            return jwtToken.Claims.First(claim => claim.Type == key).Value;
        }
    }
}
