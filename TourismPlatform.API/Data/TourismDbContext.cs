using Microsoft.EntityFrameworkCore;
using TourismPlatform.API.Models;

namespace TourismPlatform.API.Data
{
    public class TourismDbContext : DbContext
    {
        public TourismDbContext(DbContextOptions<TourismDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<AgencyProfile> AgencyProfiles { get; set; }
        public DbSet<Tour> Tours { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Review> Reviews { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(32);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("datetime('now')");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("datetime('now')");
            });

            // Configure AgencyProfile entity
            modelBuilder.Entity<AgencyProfile>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(32);
                entity.HasOne(e => e.User)
                      .WithOne(e => e.AgencyProfile)
                      .HasForeignKey<AgencyProfile>(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("datetime('now')");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("datetime('now')");
            });

            // Configure Tour entity
            modelBuilder.Entity<Tour>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(32);
                entity.HasOne(e => e.AgencyUser)
                      .WithMany(e => e.Tours)
                      .HasForeignKey(e => e.AgencyUserId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("datetime('now')");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("datetime('now')");
            });

            // Configure Booking entity
            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(32);
                entity.HasOne(e => e.Tour)
                      .WithMany(e => e.Bookings)
                      .HasForeignKey(e => e.TourId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.TouristUser)
                      .WithMany(e => e.TouristBookings)
                      .HasForeignKey(e => e.TouristUserId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("datetime('now')");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("datetime('now')");
            });

            // Configure Review entity
            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(32);
                entity.HasOne(e => e.Tour)
                      .WithMany(e => e.Reviews)
                      .HasForeignKey(e => e.TourId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.TouristUser)
                      .WithMany(e => e.Reviews)
                      .HasForeignKey(e => e.TouristUserId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("datetime('now')");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("datetime('now')");
                
                // Ensure one review per tourist per tour
                entity.HasIndex(e => new { e.TourId, e.TouristUserId }).IsUnique();
            });
        }
    }
}
