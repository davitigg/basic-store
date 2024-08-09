using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Models
{
    public enum UserRole
    {
        Admin, Buyer, Seller,
    }
    [Table("Users")]

    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string FName { get; set; }
        public string LName { get; set; }
        public UserRole Role { get; set; }
        public User(int id, string email, string password, string fName, string lName, UserRole role)
        {
            Id = id;
            Email = email.ToLower() ?? throw new ArgumentNullException(nameof(email));
            Password = password ?? throw new ArgumentNullException(nameof(password));
            FName = fName.ToLower() ?? throw new ArgumentNullException(nameof(fName));
            LName = lName.ToLower() ?? throw new ArgumentNullException(nameof(lName));
            Role = role;
        }
        public bool CheckValidity()
        {
            static bool validate(string str)
            {
                return str.Length != 0 // checks for empty string
                && str.Length <= 50 //checks for maxlength
                && !str.Contains(' ') //checks for whitespaces
                ;
            }
            if (!new EmailAddressAttribute().IsValid(Email))
            {
                return false;
            }
            if (!validate(Email))
            {
                return false;
            }
            if (!validate(Password) || Password.Length < 6)
            {
                return false;
            }
            if (!validate(FName))
            {
                return false;
            }
            if (!validate(LName))
            {
                return false;
            }
            if (Role != UserRole.Buyer && Role != UserRole.Seller && Role != UserRole.Admin)
            {
                return false;
            }
            return true;
        }
    }
}
