-- Tạo cơ sở dữ liệu mới
CREATE DATABASE MedCarePharmacyDB;
GO

USE MedCarePharmacyDB;
GO

-- 1. Bảng User
CREATE TABLE [User] (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(150) NOT NULL,
    Phone VARCHAR(20) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    Role VARCHAR(50) NOT NULL DEFAULT 'Customer',
    Status VARCHAR(50) NOT NULL DEFAULT 'Active',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- 2. Bảng Category
CREATE TABLE [Category] (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL,
    [Description] NVARCHAR(MAX) NULL
);

-- 3. Bảng Supplier
CREATE TABLE [Supplier] (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    Phone VARCHAR(20) NULL,
    Email VARCHAR(150) NULL,
    Address NVARCHAR(300) NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'Active'
);

-- 4. Bảng Product
CREATE TABLE [Product] (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    ActiveIngredient NVARCHAR(200) NULL,
    Price DECIMAL(18,2) NOT NULL,
    StockQuantity INT NOT NULL DEFAULT 0,
    Unit NVARCHAR(50) NOT NULL DEFAULT N'Hộp',
    [Description] NVARCHAR(MAX) NULL,
    ImageUrl NVARCHAR(MAX) NULL,
    CategoryId INT NULL,
    SupplierId INT NULL,
    CONSTRAINT FK_Product_Category FOREIGN KEY (CategoryId) REFERENCES [Category](Id) ON DELETE SET NULL,
    CONSTRAINT FK_Product_Supplier FOREIGN KEY (SupplierId) REFERENCES [Supplier](Id) ON DELETE SET NULL
);

-- 5. Bảng InventoryBatch
CREATE TABLE [InventoryBatch] (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    LotNumber VARCHAR(100) NOT NULL,
    Quantity INT NOT NULL,
    MfgDate DATETIME2 NOT NULL,
    ExpDate DATETIME2 NOT NULL,
    ImportPrice DECIMAL(18,2) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_InventoryBatch_Product FOREIGN KEY (ProductId) REFERENCES [Product](Id) ON DELETE CASCADE
);

-- 6. Bảng Order
CREATE TABLE [Order] (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NULL,
    CustomerName NVARCHAR(150) NOT NULL,
    Phone VARCHAR(20) NOT NULL,
    Address NVARCHAR(300) NOT NULL,
    OrderType VARCHAR(50) NOT NULL DEFAULT 'Online',
    Status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    PrescriptionUrl NVARCHAR(MAX) NULL,
    TotalAmount DECIMAL(18,2) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Order_User FOREIGN KEY (UserId) REFERENCES [User](Id) ON DELETE SET NULL
);

-- 7. Bảng OrderDetail
CREATE TABLE [OrderDetail] (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT NOT NULL,
    ProductId INT NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    CONSTRAINT FK_OrderDetail_Order FOREIGN KEY (OrderId) REFERENCES [Order](Id) ON DELETE CASCADE,
    CONSTRAINT FK_OrderDetail_Product FOREIGN KEY (ProductId) REFERENCES [Product](Id) ON DELETE CASCADE
);

-- 8. Bảng ChatMessage
CREATE TABLE [ChatMessage] (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    SenderId INT NOT NULL,
    ReceiverId INT NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    Timestamp DATETIME2 NOT NULL DEFAULT GETDATE(),
    IsRead BIT NOT NULL DEFAULT 0
);
ALTER TABLE [User] ADD Address NVARCHAR(300) NULL;
ALTER TABLE [User] ADD AvatarUrl NVARCHAR(MAX) NULL;
GO

CREATE TABLE [PharmacyStore] (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    Address NVARCHAR(300) NOT NULL,
    Phone VARCHAR(20) NOT NULL,
    Latitude DECIMAL(9,6) NULL,
    Longitude DECIMAL(9,6) NULL,
    OpeningHours NVARCHAR(100) NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'Active'
);
GO

INSERT INTO [PharmacyStore] (Name, Address, Phone, Latitude, Longitude, OpeningHours)
VALUES
(N'MedCare Quận 1', N'12 Nguyễn Huệ, Quận 1, TP.HCM', '0281111222', 10.773100, 106.703000, N'7:00 - 22:00'),
(N'MedCare Quận 3', N'45 Võ Văn Tần, Quận 3, TP.HCM', '0283333444', 10.782000, 106.692000, N'7:30 - 21:30'),
(N'MedCare Hà Nội', N'88 Trần Duy Hưng, Cầu Giấy, Hà Nội', '0245555666', 21.016000, 105.801000, N'8:00 - 22:00');
GO