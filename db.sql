CREATE DATABASE IF NOT EXISTS `final`;
USE final;
create TABLE building (
    building_id CHAR(5) PRIMARY KEY,          
    building_name CHAR(5) NOT NULL,          
    floors INT NOT NULL CHECK (floors > 0),                         
    rooms INT NOT NULL CHECK (rooms > 0),                           
    has_air_conditioner BOOLEAN NOT NULL,         
    sponsor VARCHAR(100),                         
    construction_date DATE NOT NULL,                       
    last_renovation DATE
);


create TABLE room (
    building_id CHAR(5),                      
    room_id CHAR(5),                          
    room_status ENUM('Available', 'Occupied', 'Under Maintenance') NOT NULL, 
    room_area DECIMAL(10, 2) NOT NULL CHECK (room_area > 0),            
    primary KEY (building_id, room_id),           
    constraint fk_room_building FOREIGN KEY (building_id) 
        references building(building_id)
        on DELETE CASCADE ON UPDATE CASCADE
);


  create TABLE living_room (
      building_id CHAR(5),
      room_id CHAR(5),
      max_num_of_students INT NOT NULL CHECK (max_num_of_students > 0),
      current_num_of_students INT NOT NULL default 0 CHECK (current_num_of_students >= 0),
      rental_price DECIMAL(10, 2) NOT NULL CHECK (rental_price >= 0),
      occupancy_rate DECIMAL(5, 2) NOT NULL default 0 CHECK (
          occupancy_rate >= 0
          and occupancy_rate <= 100
      ),
      check (current_num_of_students <= max_num_of_students),
      constraint fk_living_room FOREIGN KEY (building_id, room_id) 
        references room(building_id, room_id),
      primary KEY (building_id, room_id)
  );
  




-- Bảng other_room
create TABLE other_room (
    building_id CHAR(5),                       
    room_id CHAR(5),        
    room_type VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
	num_of_staff INT NOT NULL default 0 CHECK (num_of_staff >= 0),

    primary KEY (building_id, room_id),            
    constraint fk_other_room FOREIGN KEY (building_id, room_id) 
        references room(building_id, room_id)
        on DELETE CASCADE ON UPDATE CASCADE
);

  create TABLE student (
--   sssn là CCCD
	sssn char(8) primary key,
    first_name VARCHAR(20) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    birthday DATE NOT NULL,
    sex CHAR(1) CHECK (sex IN ('M', 'F')),
    ethnic_group VARCHAR(30),
    study_status VARCHAR(20),
    health_state VARCHAR(100),
    student_id CHAR(12) UNIQUE,
    class_name VARCHAR(30),
    faculty VARCHAR(50),

    -- Liên kết với phòng ở
    building_id CHAR(5),
    room_id CHAR(5),
      
      constraint fk_student_room FOREIGN KEY (building_id, room_id) REFERENCES living_room(building_id, room_id) 
 );
 
CREATE TABLE phone_number (
    sssn CHAR(8),
    phone_number CHAR(10),
    PRIMARY KEY (sssn, phone_number),
    CONSTRAINT fk_phone_number FOREIGN KEY (sssn) REFERENCES student(sssn)
    ON DELETE CASCADE ON UPDATE CASCADE
);

create TABLE address (
	sssn 			char(8),
    commune			varchar(30),
    province 		varchar(30),
    primary key (sssn, commune, province),
    constraint fk_address foreign key (sssn) references student(sssn)
    on DELETE CASCADE
	on UPDATE CASCADE
);

create TABLE email (
	sssn 			char(8),
    email 		varchar(50),
    primary key (sssn, email),
    constraint fk_email foreign key (sssn) references student(sssn)
    on DELETE CASCADE
	on UPDATE CASCADE
);
   




create TABLE relative (
      sssn char(8),
      fname varchar(20) not null,
      lname varchar(20) not null,
      birthday date not null,
      relationship varchar(50) not null,
      address varchar(255) not null,
      phone_number char(10),
      job varchar(50),
      primary key(sssn, fname, lname),
      constraint fk_relative foreign key (sssn) references student(sssn) ON DELETE CASCADE ON UPDATE CASCADE
  );
  
  create TABLE disciplinary_action (
      action_id varchar(20) primary key,
      action_type varchar(50) not null,
      reason text not null,
      decision_date date not null,
      effective_from date not null,
      effective_to date,
      severity_level VARCHAR(20) CHECK (
          severity_level IN ('low', 'medium', 'high', 'expulsion')
      ),
      status VARCHAR(20) CHECK (
          status IN ('pending', 'active', 'completed', 'cancelled')
      )
  );
  create TABLE student_discipline (
      action_id varchar(20),
      sssn char(8),
      primary key(action_id, sssn),
      constraint fk_student_discipline_d foreign key (action_id) references disciplinary_action(action_id) ON DELETE CASCADE ON UPDATE CASCADE,
      constraint fk_student_discipline_s foreign key (sssn) references student(sssn) ON DELETE CASCADE ON UPDATE CASCADE
  );


  

create TABLE dormitory_card (
    number CHAR(7) NOT NULL PRIMARY KEY,
    start_date DATE,
    end_date DATE,
    check (Start_Date <= End_Date),
    id_card CHAR(8) NOT NULL,
    validity BOOLEAN DEFAULT TRUE,
    foreign KEY (id_card) REFERENCES student(sssn) ON UPDATE CASCADE ON DELETE CASCADE
);




==============================================trigger================================================


DELIMITER $$
CREATE TRIGGER before_insert_dormitory_card
BEFORE INSERT ON dormitory_card
FOR EACH ROW
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE id_candidate CHAR(7);

    -- Tạo số thẻ mới cho dormitory_card
    id_loop: WHILE i <= 99999 DO
        SET id_candidate = CONCAT('DC', LPAD(i, 5, '0')); -- DC = Dormitory Card

        IF NOT EXISTS (SELECT 1 FROM dormitory_card WHERE number = id_candidate) THEN
            -- Gán số thẻ mới
            SET NEW.number = id_candidate;

            -- Set các giá trị mặc định
            IF NEW.start_date IS NULL THEN
                SET NEW.start_date = CURRENT_DATE + INTERVAL 14 DAY;
            END IF;

            IF NEW.end_date IS NULL THEN
                SET NEW.end_date = CURRENT_DATE + INTERVAL 2 YEAR;
            END IF;

            IF NEW.validity IS NULL THEN
                SET NEW.validity = TRUE;
            END IF;

            LEAVE id_loop;
        END IF;

        SET i = i + 1;
    END WHILE id_loop;
END$$
DELIMITER ;


DELIMITER ;


-- trigger khi thêm một sinh viên, kiểm tra xem số sinh viên phòng hiện tại có bé hơn số sinh viên tối đa không, nếu có thì thêm và 
  -- thay đổi số sinh viên hiện tại, tỉ lệ lấp đầy.
delimiter $$

create trigger before_insert_student
before insert on student
for each row
begin 
	declare v_now_num int;
    declare v_max_num int;
    declare v_new_now_num int;
    select current_num_of_students, max_num_of_students
    into v_now_num, v_max_num
    from living_room 
    where room_id = new.room_id and building_id = new.building_id;
    
    if v_now_num >= v_max_num then
		signal sqlstate '45000'
        set message_text = 'The room is full of students.';
    end if;
    
    set v_new_now_num = v_now_num + 1;
    
    update living_room
    set current_num_of_students = v_new_now_num, occupancy_rate = v_new_now_num/max_num_of_students * 100
    where room_id = new.room_id and building_id = new.building_id;
end$$

delimiter ;


-- trigger xóa 1 student ra khỏi hệ thống 
DELIMITER $$

CREATE TRIGGER before_delete_student
BEFORE DELETE ON student
FOR EACH ROW
BEGIN
    DECLARE v_now INT;
    DECLARE v_max INT;

    -- Kiểm tra nếu sinh viên không ở KTX thì không cần làm gì
    IF OLD.room_id IS NOT NULL AND OLD.building_id IS NOT NULL THEN
        -- Lấy số sinh viên hiện tại và tối đa của phòng
        SELECT current_num_of_students, max_num_of_students
        INTO v_now, v_max
        FROM living_room
        WHERE room_id = OLD.room_id AND building_id = OLD.building_id;

        -- Nếu số sinh viên trong phòng > 0 thì mới cập nhật
        IF v_now > 0 THEN
            -- Cập nhật bảng living_room
            UPDATE living_room
            SET current_num_of_students = v_now - 1,
                occupancy_rate = 100.0 * (v_now - 1) / v_max
            WHERE room_id = OLD.room_id AND building_id = OLD.building_id;

            -- Nếu sau khi trừ còn 0 sinh viên -> cập nhật room_status
            IF v_now - 1 = 0 THEN
                UPDATE room
                SET room_status = 'Available'
                WHERE room_id = OLD.room_id AND building_id = OLD.building_id;
            END IF;
        END IF;
    END IF;
END$$

DELIMITER ;



-- --trigger chuyển phòng cho student

DELIMITER $$

CREATE TRIGGER after_update_student_room
AFTER UPDATE ON student
FOR EACH ROW
BEGIN
    DECLARE old_now INT;
    DECLARE old_max INT;
    DECLARE new_now INT;
    DECLARE new_max INT;

    -- Nếu phòng thay đổi thì mới cập nhật
    IF OLD.room_id IS NOT NULL AND OLD.building_id IS NOT NULL AND
       (OLD.room_id != NEW.room_id OR OLD.building_id != NEW.building_id) THEN

        -- Trừ sinh viên khỏi phòng cũ
        SELECT current_num_of_students, max_num_of_students
        INTO old_now, old_max
        FROM living_room
        WHERE room_id = OLD.room_id AND building_id = OLD.building_id;

        UPDATE living_room
        SET current_num_of_students = old_now - 1,
            occupancy_rate = ROUND(100.0 * (old_now - 1) / old_max, 2)
        WHERE room_id = OLD.room_id AND building_id = OLD.building_id;

        -- Nếu phòng cũ còn 0 sinh viên -> set Available
        IF old_now - 1 = 0 THEN
            UPDATE room
            SET room_status = 'Available'
            WHERE room_id = OLD.room_id AND building_id = OLD.building_id;
        END IF;

        -- Cộng sinh viên vào phòng mới
        SELECT current_num_of_students, max_num_of_students
        INTO new_now, new_max
        FROM living_room
        WHERE room_id = NEW.room_id AND building_id = NEW.building_id;

        UPDATE living_room
        SET current_num_of_students = new_now + 1,
            occupancy_rate = ROUND(100.0 * (new_now + 1) / new_max, 2)
        WHERE room_id = NEW.room_id AND building_id = NEW.building_id;
    END IF;
END$$

DELIMITER ;


--    Sinh viên có hình thức kỉ luật "Expulsion" thì không được ở kí túc xã+cập nhật thông tin phòng sinh viên bị đuổi 

DELIMITER //

CREATE TRIGGER after_expulsion
AFTER INSERT ON student_discipline
FOR EACH ROW
BEGIN 
    DECLARE severity ENUM('low', 'medium', 'high', 'expulsion');
    DECLARE action_status ENUM('pending', 'active', 'completed', 'cancelled');
    DECLARE old_room CHAR(5);
    DECLARE old_building CHAR(5);

    SELECT severity_level, status
    INTO severity, action_status
    FROM disciplinary_action
    WHERE action_id = NEW.action_id;

    IF severity = 'expulsion' AND action_status = 'active' THEN
        SELECT room_id, building_id INTO old_room, old_building
        FROM student
        WHERE sssn = NEW.sssn;

        UPDATE student
        SET room_id = NULL,
            building_id = NULL
        WHERE sssn = NEW.sssn;

        UPDATE living_room
        SET current_num_of_students = current_num_of_students - 1,
            occupancy_rate = 100.0 * (current_num_of_students - 1) / max_num_of_students
        WHERE room_id = old_room AND building_id = old_building;
    END IF;
END //

DELIMITER ;

--    Sinh viên có 3 hình thức kỉ luật "High" thì không được ở kí túc xã+cập nhật thông tin phòng sinh viên bị đuổi 

DELIMITER //

CREATE TRIGGER check_high_violations
AFTER INSERT ON student_discipline
FOR EACH ROW
BEGIN
    DECLARE total_high INT;
    DECLARE old_room CHAR(5);
    DECLARE old_building CHAR(5);

    SELECT COUNT(*) INTO total_high
    FROM student_discipline sd
    JOIN disciplinary_action da ON sd.action_id = da.action_id
    WHERE sd.sssn = NEW.sssn
      AND da.severity_level = 'high'
      AND da.status IN ('active', 'completed');

    IF total_high >= 3 THEN
        SELECT room_id, building_id INTO old_room, old_building
        FROM student
        WHERE sssn = NEW.sssn;

        UPDATE student
        SET room_id = NULL,
            building_id = NULL
        WHERE sssn = NEW.sssn;

        UPDATE living_room
        SET current_num_of_students = current_num_of_students - 1,
            occupancy_rate = 100.0 * (current_num_of_students - 1) / max_num_of_students
        WHERE room_id = old_room AND building_id = old_building;
    END IF;
END //

DELIMITER ;



-- 4 trigger kiểm tra các phòng không thể trùng loại phòng.
DELIMITER //

CREATE TRIGGER trg_insert_living_room
BEFORE INSERT ON living_room
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1 FROM other_room WHERE building_id = NEW.building_id AND room_id = NEW.room_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room already assigned to another function';
    END IF;
END;
//
delimiter ;

DELIMITER //
CREATE TRIGGER trg_update_occupancy_rate
BEFORE UPDATE ON living_room
FOR EACH ROW
BEGIN
    IF NEW.current_num_of_students != OLD.current_num_of_students THEN
        SET NEW.occupancy_rate = (NEW.current_num_of_students * 100.0) / NEW.max_num_of_students;
    END IF;
END;
//
delimiter ;



-- ==========================================INSERT==============================================================================

INSERT INTO building (building_id, building_name, floors, rooms, has_air_conditioner, sponsor, construction_date, last_renovation)
VALUES
('BK001', 'BK001', 4, 16, TRUE, 'HCMUT', '2015-01-01', '2022-06-01'),
('BK002', 'BK002', 4, 16, FALSE, 'HCMUT', '2016-03-15', '2023-02-10'),
('BK003', 'BK003', 4, 16, TRUE, 'HCMUT', '2017-05-10', '2021-09-20'),
('BK004', 'BK004', 4, 16, TRUE, 'HCMUT', '2018-07-25', NULL);

INSERT INTO room (building_id, room_id, room_status, room_area) VALUES
('BK001', 'P.101', 'Available', 25.0),
('BK001', 'P.102', 'Available', 25.0),
('BK001', 'P.103', 'Available', 25.0),
('BK001', 'P.104', 'Available', 25.0),
('BK001', 'P.201', 'Occupied', 25.0),
('BK001', 'P.202', 'Occupied', 25.0),
('BK001', 'P.203', 'Occupied', 25.0),
('BK001', 'P.204', 'Occupied', 25.0),
('BK001', 'P.301', 'Under Maintenance', 25.0),
('BK001', 'P.302', 'Available', 25.0),
('BK001', 'P.303', 'Available', 25.0),
('BK001', 'P.304', 'Available', 25.0),
('BK001', 'P.401', 'Available', 25.0),
('BK001', 'P.402', 'Occupied', 25.0),
('BK001', 'P.403', 'Occupied', 25.0),
('BK001', 'P.404', 'Available', 25.0);

INSERT INTO room (building_id, room_id, room_status, room_area) VALUES
('BK002', 'P.101', 'Available', 25.0),
('BK002', 'P.102', 'Available', 25.0),
('BK002', 'P.103', 'Available', 25.0),
('BK002', 'P.104', 'Available', 25.0),
('BK002', 'P.201', 'Occupied', 25.0),
('BK002', 'P.202', 'Occupied', 25.0),
('BK002', 'P.203', 'Occupied', 25.0),
('BK002', 'P.204', 'Occupied', 25.0),
('BK002', 'P.301', 'Under Maintenance', 25.0),
('BK002', 'P.302', 'Available', 25.0),
('BK002', 'P.303', 'Available', 25.0),
('BK002', 'P.304', 'Available', 25.0),
('BK002', 'P.401', 'Available', 25.0),
('BK002', 'P.402', 'Occupied', 25.0),
('BK002', 'P.403', 'Occupied', 25.0),
('BK002', 'P.404', 'Available', 25.0);

INSERT INTO room (building_id, room_id, room_status, room_area) VALUES
('BK003', 'P.101', 'Available', 25.0),
('BK003', 'P.102', 'Available', 25.0),
('BK003', 'P.103', 'Available', 25.0),
('BK003', 'P.104', 'Available', 25.0),
('BK003', 'P.201', 'Occupied', 25.0),
('BK003', 'P.202', 'Occupied', 25.0),
('BK003', 'P.203', 'Occupied', 25.0),
('BK003', 'P.204', 'Occupied', 25.0),
('BK003', 'P.301', 'Under Maintenance', 25.0),
('BK003', 'P.302', 'Available', 25.0),
('BK003', 'P.303', 'Available', 25.0),
('BK003', 'P.304', 'Available', 25.0),
('BK003', 'P.401', 'Available', 25.0),
('BK003', 'P.402', 'Occupied', 25.0),
('BK003', 'P.403', 'Occupied', 25.0),
('BK003', 'P.404', 'Available', 25.0);

INSERT INTO room (building_id, room_id, room_status, room_area) VALUES
('BK004', 'P.101', 'Available', 25.0),
('BK004', 'P.102', 'Available', 25.0),
('BK004', 'P.103', 'Available', 25.0),
('BK004', 'P.104', 'Available', 25.0),
('BK004', 'P.201', 'Occupied', 25.0),
('BK004', 'P.202', 'Occupied', 25.0),
('BK004', 'P.203', 'Occupied', 25.0),
('BK004', 'P.204', 'Occupied', 25.0),
('BK004', 'P.301', 'Under Maintenance', 25.0),
('BK004', 'P.302', 'Available', 25.0),
('BK004', 'P.303', 'Available', 25.0),
('BK004', 'P.304', 'Available', 25.0),
('BK004', 'P.401', 'Available', 25.0),
('BK004', 'P.402', 'Occupied', 25.0),
('BK004', 'P.403', 'Occupied', 25.0),
('BK004', 'P.404', 'Available', 25.0);



INSERT INTO living_room (building_id, room_id, max_num_of_students, rental_price)
VALUES
('BK001', 'P.104', 6, 1500000.00),
('BK001', 'P.201', 6, 1500000.00),
('BK001', 'P.202', 6, 1500000.00),
('BK001', 'P.203', 6, 1500000.00),
('BK001', 'P.204', 6, 1500000.00),
('BK001', 'P.301', 6, 1500000.00),
('BK001', 'P.302', 6, 1500000.00),
('BK001', 'P.303', 6, 1500000.00),
('BK001', 'P.304', 6, 1500000.00),
('BK001', 'P.401', 6, 1500000.00),
('BK001', 'P.402', 6, 1500000.00),
('BK001', 'P.403', 6, 1500000.00),
('BK001', 'P.404', 6, 1500000.00),
-- BK002
('BK002', 'P.102', 6, 1500000.00),
('BK002', 'P.104', 6, 1500000.00),
('BK002', 'P.201', 6, 1500000.00),
('BK002', 'P.202', 6, 1500000.00),
('BK002', 'P.203', 6, 1500000.00),
('BK002', 'P.204', 6, 1500000.00),
('BK002', 'P.301', 6, 1500000.00),
('BK002', 'P.302', 6, 1500000.00),
('BK002', 'P.303', 6, 1500000.00),
('BK002', 'P.304', 6, 1500000.00),
('BK002', 'P.401', 6, 1500000.00),
('BK002', 'P.402', 6, 1500000.00),
('BK002', 'P.403', 6, 1500000.00),
('BK002', 'P.404', 6, 1500000.00),
-- BK003
('BK003', 'P.102', 6, 1500000.00),
('BK003', 'P.104', 6, 1500000.00),
('BK003', 'P.201', 6, 1500000.00),
('BK003', 'P.202', 6, 1500000.00),
('BK003', 'P.203', 6, 1500000.00),
('BK003', 'P.204', 6, 1500000.00),
('BK003', 'P.301', 6, 1500000.00),
('BK003', 'P.302', 6, 1500000.00),
('BK003', 'P.303', 6, 1500000.00),
('BK003', 'P.304', 6, 1500000.00),
('BK003', 'P.401', 6, 1500000.00),
('BK003', 'P.402', 6, 1500000.00),
('BK003', 'P.403', 6, 1500000.00),
('BK003', 'P.404', 6, 1500000.00),
-- BK004
('BK004', 'P.102', 6, 1500000.00),
('BK004', 'P.104', 6, 1500000.00),
('BK004', 'P.201', 6, 1500000.00),
('BK004', 'P.202', 6, 1500000.00),
('BK004', 'P.203', 6, 1500000.00),
('BK004', 'P.204', 6, 1500000.00),
('BK004', 'P.301', 6, 1500000.00),
('BK004', 'P.302', 6, 1500000.00),
('BK004', 'P.303', 6, 1500000.00),
('BK004', 'P.304', 6, 1500000.00),
('BK004', 'P.401', 6, 1500000.00),
('BK004', 'P.402', 6, 1500000.00),
('BK004', 'P.403', 6, 1500000.00),
('BK004', 'P.404', 6, 1500000.00);

INSERT INTO student VALUES
('05620513', 'Khoi', 'Nguyen Minh', '2003-06-03', 'M', 'Kinh', 'Active', 'Good', '2312613', 'KHMT1', 'Computer Science','BK001', 'P.104'),
('05620514', 'Mai', 'Nguyen Phuong', '2006-03-09', 'F', 'Kinh', 'Active', 'Good', '2212345', 'KHMT2', 'Computer Science','BK001', 'P.104'),
('05620515', 'Ngoc', 'Nguyen Minh', '2003-12-01', 'F', 'Kinh', 'Active', 'Good', '2012346', 'CNTT1', 'Information Technology','BK003', 'P.204'),
('05620516', 'Nam', 'Nguyen Hao', '2006-03-02', 'M', 'Kinh', 'Active', 'Good', '2112347', 'CNTT2', 'Information Technology','BK001', 'P.104'),
('05620517', 'Ngan', 'Pham Kim', '2003-10-20', 'F', 'Kinh', 'Active', 'Good', '2312348', 'DTVT1', 'Electronics and Telecommunications Engineering','BK002', 'P.102'),
('05620518', 'Phuong', 'Tran Ngoc', '2005-03-26', 'F', 'Kinh', 'Active', 'Good', '2412349', 'DTVT2', 'Electronics and Telecommunications Engineering','BK002', 'P.104'),
('05620519', 'Phu', 'Nguyen Quoc', '2005-07-23', 'M', 'Kinh', 'Active', 'Good', '2212350', 'CK1', 'Mechanical Engineering','BK002', 'P.203'),
('05620520', 'Phung', 'Nguyen Minh', '2004-05-01', 'F', 'Kinh', 'Non_Active', 'Good', '2012351', 'CK2', 'Mechanical Engineering','BK002', 'P.102'),
('05620521', 'Quan', 'Vo Anh', '2005-09-06', 'M', 'Kinh', 'Active', 'Good', '2112352', 'D1', 'Electrical Engineering','BK003', 'P.104'),
('05620522', 'Phuoc', 'Nguyen Thien', '2005-10-18', 'M', 'Kinh', 'Active', 'Good', '2312353', 'D2', 'Electrical Engineering','BK003', 'P.104'),
('05620523', 'Quynh', 'Nguyen Ngoc Diem', '2006-02-01', 'F', 'Kinh', 'Active', 'Good', '2412354', 'HTTT1', 'Information Security','BK003', 'P.104'),
('05620524', 'Quynh', 'Nguyen Thi Diem', '2004-05-01', 'F', 'Kinh', 'Active', 'Good', '2212355', 'HTTT2', 'Information Security','BK003', 'P.104'),
('05620525', 'Phat', 'Vo Tan', '2004-05-01', 'M', 'Kinh', 'Active', 'Good', '2012356', 'XD1', 'Civil Engineering','BK003', 'P.104'),
('05620526', 'Son', 'Bui Ngoc', '2003-12-12', 'M', 'Kinh', 'Active', 'Good', '2112357', 'XD2', 'Civil Engineering','BK003', 'P.104'),
('05620527', 'Tai', 'Nguyen Duc', '2003-09-30', 'M', 'Thai', 'Active', 'Good', '2312358', 'H1', 'Chemical Engineering','BK004', 'P.104'),
('05620528', 'Tan', 'Nguyen Nhat', '2004-01-31', 'M', 'Kinh', 'Active', 'Good', '2412359', 'H2', 'Chemical Engineering','BK004', 'P.104'),
('05620529', 'Tien', 'Phan Ngoc', '2005-09-17', 'M', 'Kinh', 'Non_Active', 'Good', '2212360', 'MT1', 'Environmental Engineering','BK001', 'P.204'),
('05620530', 'Tu', 'Nguyen Anh', '2003-02-12', 'M', 'Kinh', 'Active', 'Good', '2012361', 'MT2', 'Environmental Engineering','BK001', 'P.204'),
('05620531', 'Tuong', 'Nguyen Ngoc', '2005-03-14', 'M', 'Kinh', 'Active', 'Good', '2112362', 'DK1', 'Control and Automation Engineering','BK001', 'P.204'),
('05620532', 'Thao', 'Nguyen Ngoc Thanh', '2006-02-04', 'F', 'Kinh', 'Active', 'Good', '2312363', 'DK2', 'Control and Automation Engineering','BK001', 'P.204'),
('05620533', 'Thu', 'Nguyen Ngoc Minh', '2005-03-31', 'F', 'Kinh', 'Active', 'Good', '2412364', 'QL1', 'Industrial Management','BK002', 'P.204'),
('05620534', 'Thuy', 'Nguyen Thi Thanh', '2003-02-15', 'F', 'Kinh', 'Active', 'Good', '2212365', 'QL2', 'Industrial Management','BK002', 'P.204'),
('05620535', 'Uyen', 'Nguyen Ngoc', '2005-02-18', 'M', 'Kinh', 'Active', 'Good', '2012366', 'SCM1', 'Logistics and Supply Chain Management','BK002', 'P.204'),
('05620536', 'Vy', 'Nguyen Tuong', '2004-06-13', 'M', 'Kinh', 'Active', 'Good', '2112367', 'SCM2', 'Logistics and Supply Chain Management','BK002', 'P.204'),
('05620537', 'Vu', 'Tran Van', '2003-02-12', 'M', 'Kinh', 'Active', 'Good', '2312368', 'VL1', 'Materials Engineering','BK003', 'P.204'),
('05620538', 'Duc', 'Nguyen Minh', '2003-03-15', 'M', 'Tay', 'Active', 'Good', '2412369', 'VL2', 'Materials Engineering','BK003', 'P.204'),
('05620539', 'Toan', 'Bui Duc', '2006-01-16', 'M', 'Kinh', 'Active', 'Good', '2212370', 'SH1', 'Biotechnology','BK003', 'P.204'),
('05620540', 'Tram', 'Nguyen Thuy', '2004-08-01', 'F', 'Kinh', 'Non_Active', 'Good', '2012371', 'SH2', 'Biotechnology','BK003', 'P.204'),
('05620541', 'Truc', 'Pham Ngoc', '2006-01-24', 'M', 'Kinh', 'Active', 'Good', '2412374', 'KT1', 'Computer Engineering','BK004', 'P.204'),
('05620542', 'Hau', 'Nguyen Phuc', '2005-06-01', 'F', 'Kinh', 'Active', 'Good', '2212375', 'KT2', 'Computer Engineering','BK004', 'P.204'),
('05620543', 'Thuan', 'Luong Minh', '2003-12-05', 'M', 'Kinh', 'Active', 'Good', '2112382', 'XD3', 'Civil Engineering','BK004', 'P.204'),
('05620544', 'Nhi', 'Nguyen Ngoc Thuy', '2006-03-20', 'F', 'Kinh', 'Active', 'Good', '2312383', 'H3', 'Chemical Engineering','BK004', 'P.204'),
('05620545', 'Dai', 'Nguyen Van', '2005-02-17', 'M', 'Kinh', 'Active', 'Good', '2012376', 'KHMT3', 'Computer Science','BK001', 'P.304'),
('05620546', 'Khiem', 'Pham Gia', '2003-09-23', 'M', 'Kinh', 'Active', 'Good', '2112377', 'CNTT3', 'Information Technology','BK001', 'P.304'),
('05620547', 'Tran', 'Nguyen Ngoc Thao', '2005-05-29', 'F', 'Kinh', 'Active', 'Good', '2312378', 'DTVT3', 'Electronics and Telecommunications Engineering','BK001', 'P.304'),
('05620548', 'Tien', 'Nguyen Thuy', '2004-03-19', 'F', 'Kinh', 'Active', 'Good', '2412379', 'CK3', 'Mechanical Engineering','BK001', 'P.304'),
('05620549', 'Tuan', 'Nguyen Quoc', '2005-09-12', 'M', 'Kinh', 'Active', 'Good', '2212380', 'D3', 'Electrical Engineering','BK003', 'P.304'),
('05620550', 'Chi', 'Bui Ngoc Kim', '2003-09-15', 'F', 'Hoa', 'Active', 'Good', '2012381', 'HTTT3', 'Information Security','BK003', 'P.304'),
('05620551', 'Chi', 'Pham Minh', '2006-04-01', 'M', 'Kinh', 'Active', 'Good', '2112372', 'PM1', 'Software Engineering','BK003', 'P.304'),
('05620552', 'Chien', 'Tran Duc', '2002-01-26', 'M', 'Kinh', 'Active', 'Good', '2312373', 'PM2', 'Software Engineering','BK003', 'P.304');

 


INSERT INTO other_room (building_id, room_id, room_type, start_time, end_time)
VALUES
('BK001', 'P.103', 'Meeting Room', '09:00:00', '17:00:00'),
('BK002', 'P.103', 'Meeting Room', '09:00:00', '17:00:00'),
('BK003', 'P.103', 'Meeting Room', '09:00:00', '17:00:00'),
('BK004', 'P.103', 'Meeting Room', '09:00:00', '17:00:00');

insert into phone_number (sssn, phone_number) values
('05620513', '0389162347'),
('05620514', '0328190284'),
('05620515', '0323824785'),
('05620516', '0309238478'),
('05620516', '0302455638'),
('05620517', '0320245757'),
('05620518', '0329287547'),
('05620518', '0329309458'),
('05620519', '0320918267'),
('05620520', '0387326653'),
('05620521', '0320975643'),
('05620521', '0329235432'),
('05620522', '0399706545'),
('05620523', '0328100038'),
('05620524', '0391203470'),
('05620525', '0328906742'),
('05620525', '0392348324'),
('05620526', '0328109200'),
('05620527', '0328102980'),
('05620527', '0328239804'),
('05620528', '0322134783'),
('05620529', '0320975423'),
('05620530', '0328100347'),
('05620531', '0326784592'),
('05620531', '0322349823'),
('05620532', '0326735204'),
('05620533', '0327843792'),
('05620534', '0328129343'),
('05620534', '0339852345'),
('05620535', '0393280450'),
('05620536', '0924723455'),
('05620536', '0959873235'),
('05620537', '0739012012'),
('05620538', '0928761451'),
('05620539', '0322934734'),
('05620540', '0329235483'),
('05620540', '0325359783'),
('05620541', '0328198534'),
('05620542', '0327684529'),
('05620543', '0320394754'),
('05620544', '0309237432'),
('05620544', '0329483452'),
('05620545', '0320293745'),
('05620546', '0302348523'),
('05620546', '0339854982'),
('05620547', '0920975343'),
('05620548', '0322934523'),
('05620548', '0339845723'),
('05620549', '0328102409'),
('05620550', '0328724234'),
('05620550', '0339785329'),
('05620551', '0329235798'),
('05620552', '0329459838');



insert into address (sssn, commune, province) values
('05620513', 'Tam Dan', 'Quang Nam'),
('05620514', 'Son Tra', 'Da Nang'),
('05620515', 'Cam Le', 'Da Nang'),
('05620516', 'Thanh Khe', 'Da Nang'),
('05620517', 'Hoa Vang', 'Da Nang'),
('05620518', 'Hoa An', 'Da Nang'),
('05620518', 'Thanh Khe', 'Da Nang'),
('05620519', 'Cau Moi', 'Quang Ninh'),
('05620520', 'Bai Chay', 'Quang Ninh'),
('05620521', 'Quang Trung', 'Quang Ninh'),
('05620522', 'Yen Thanh', 'Quang Ninh'),
('05620522', 'Nam Dong', 'Thua Thien Hue'),
('05620523', 'Mong Duong', 'Quang Ninh'),
('05620524', 'Uong Bi', 'Quang Ninh'),
('05620525', 'Dong Tien', 'Hoa Binh'),
('05620526', 'Mai Chau', 'Hoa Binh'),
('05620527', 'Dinh Hoa', 'Thai Nguyen'),
('05620528', 'Son Cam', 'Thai Nguyen'),
('05620529', 'Hoa Binh', 'Hoa Binh'),
('05620530', 'Lang Son', 'Lang Son'),
('05620531', 'Phu Tan', 'Dong Nai'),
('05620532', 'Bac Giang', 'Bac Giang'),
('05620533', 'Tuy An', 'Phu Yen'),
('05620533', 'Tan Xuan', 'Phu Yen'),
('05620534', 'Phu Ly', 'Ha Nam'),
('05620535', 'Duc Tho', 'Ha Tinh'),
('05620536', 'Quynh Luu', 'Nghe An'),
('05620537', 'Vinh', 'Nghe An'),
('05620537', 'Dong Tien', 'Hoa Binh'),
('05620538', 'Nam Dan', 'Nghe An'),
('05620539', 'Thanh Chuong', 'Nghe An'),
('05620540', 'Cua Lo', 'Nghe An'),
('05620541', 'Hung Nguyen', 'Nghe An'),
('05620542', 'Kien Thuy', 'Hai Phong'),
('05620543', 'Ngo Quyen', 'Hai Phong'),
('05620544', 'An Lao', 'Hai Phong'),
('05620545', 'Van Lam', 'Hung Yen'),
('05620545', 'Yen Thanh', 'Quang Ninh'),
('05620546', 'Cua Lo', 'Nghe An'),
('05620546', 'Phan Thiet', 'Binh Thuan'),
('05620547', 'Tan Nghia', 'Binh Thuan'),
('05620547', 'Hung Nguyen', 'Nghe An'),
('05620548', 'Dong Ha', 'Quang Tri'),
('05620549', 'Huong Thuy', 'Thua Thien Hue'),
('05620550', 'Phu Bai', 'Thua Thien Hue'),
('05620551', 'Nam Dong', 'Thua Thien Hue'),
('05620552', 'Huong Tra', 'Thua Thien Hue');



insert into email values 
('05620513', 'khoi.nguyenminh03@hcmut.edu.vn'),
('05620513', 'khoinguyen13@gmail.com'),
('05620514', 'mai.nguyenphuong06@hcmut.edu.vn'),
('05620515', 'ngoc.nguyenminh03@hcmut.edu.vn'),
('05620516', 'nam.nguyenhao06@hcmut.edu.vn'),
('05620516', 'namhao987@gmail.com'),
('05620517', 'ngan.phamkim03@hcmut.edu.vn'),
('05620518', 'phuong.tranngoc05@hcmut.edu.vn'),
('05620519', 'phu.nguyenquoc05@hcmut.edu.vn'),
('05620520', 'phung.nguyenminh04@hcmut.edu.vn'),
('05620521', 'quan.voanh05@hcmut.edu.vn'),
('05620521', 'quanvo05@gmail.com'),
('05620522', 'phuoc.nguyenthien05@hcmut.edu.vn'),
('05620523', 'quynh.nguyenngocdiem06@hcmut.edu.vn'),
('05620524', 'quynh.nguyenthidiem04@hcmut.edu.vn'),
('05620525', 'phat.vo10@hcmut.edu.vn'),
('05620525', 'phatvo@gmail.com'),
('05620526', 'son.buingoc03@hcmut.edu.vn'),
('05620527', 'tai.nguyenduc03@hcmut.edu.vn'),
('05620528', 'tan.nguyennhat04@hcmut.edu.vn'),
('05620528', 'tannhat@gmail.com'),
('05620529', 'tien.phanngoc05@hcmut.edu.vn'),
('05620529', 'tienphan@gmail.com'),
('05620530', 'tu.nguyenanh03@hcmut.edu.vn'),
('05620531', 'tuong.nguyenngoc05@hcmut.edu.vn'),
('05620532', 'thao.nguyenngocthanh06@hcmut.edu.vn'),
('05620533', 'thu.nguyenngocminh05@hcmut.edu.vn'),
('05620533', 'thuminhnguyen123@gmail.com'),
('05620534', 'thuy.nguyenthithanh03@hcmut.edu.vn'),
('05620535', 'uyen.nguyenngoc05@hcmut.edu.vn'),
('05620536', 'vy.nguyenthuong04@hcmut.edu.vn'),
('05620537', 'vu.tranvan03@hcmut.edu.vn'),
('05620538', 'duc.nguyenminh03@hcmut.edu.vn'),
('05620539', 'toan.buiduc06@hcmut.edu.vn'),
('05620539', 'toanducr@gmail.com'),
('05620540', 'tram.nguyenthuy04@hcmut.edu.vn'),
('05620541', 'truc.phamngoc06@hcmut.edu.vn'),
('05620542', 'hau.nguyenphuc05@hcmut.edu.vn'),
('05620543', 'thuan.luongminh03@hcmut.edu.vn'),
('05620544', 'nhi.nguyenngocthuy06@hcmut.edu.vn'),
('05620545', 'dai.nguyenvan05@hcmut.edu.vn'),
('05620545', 'daivan@gmail.com'),
('05620546', 'khiem.phamgia03@hcmut.edu.vn'),
('05620547', 'tran.nguyenngocthao05@hcmut.edu.vn'),
('05620548', 'tien.nguyenthuy04@hcmut.edu.vn'),
('05620549', 'tuan.nguyenquoc05@hcmut.edu.vn'),
('05620549', 'tuannguyen@gmail.com'),
('05620550', 'chi.buingockim03@hcmut.edu.vn'),
('05620551', 'chi.phamminh06@hcmut.edu.vn'),
('05620551', 'chipham00@gmail.com'),
('05620552', 'chien.tranduc02@hcmut.edu.vn');

INSERT INTO relative VALUES
-- Relatives for student 05620513
('05620513', 'An', 'Nguyen Van', '1975-05-15', 'Father', 'Tam Dan, Phu Ninh, Quang Nam', '0389162345', 'Teacher'),
('05620513', 'Hoa', 'Tran Thi', '1978-08-20', 'Mother', 'Tam Dan, Phu Ninh, Quang Nam', '0389162346', 'Nurse'),

-- Relatives for student 05620514
('05620514', 'Phong', 'Dang Quang', '1976-03-10', 'Father', 'Son Tra, Son Tra, Da Nang', '0328190285', 'Engineer'),
('05620514', 'Linh', 'Nguyen Thi', '1980-11-25', 'Mother', 'Son Tra, Son Tra, Da Nang', '0328190286', 'Accountant'),

-- Relatives for student 05620515
('05620515', 'Hung', 'Le Van', '1973-07-18', 'Father', 'Cam Le, Cam Le, Da Nang', '0323824786', 'Doctor'),
('05620515', 'Thuy', 'Tran Thi', '1975-09-30', 'Mother', 'Cam Le, Cam Le, Da Nang', '0323824787', 'Teacher'),

-- Relatives for student 05620516
('05620516', 'Tuan', 'Nguyen Anh', '1972-12-05', 'Father', 'Thanh Khe, Thanh Khe, Da Nang', '0309238479', 'Businessman'),
('05620516', 'Mai', 'Pham Thi', '1976-04-15', 'Mother', 'Thanh Khe, Thanh Khe, Da Nang', '0309238480', 'Housewife'),

-- Relatives for student 05620517
('05620517', 'Cuong', 'Vo Van', '1970-06-20', 'Father', 'Hoa Vang, Hoa Vang, Da Nang', '0320245758', 'Police Officer'),
('05620517', 'Lan', 'Nguyen Thi', '1974-10-10', 'Mother', 'Hoa Vang, Hoa Vang, Da Nang', '0320245759', 'Nurse'),

-- Relatives for student 05620518
('05620518', 'Dung', 'Tran Van', '1971-01-15', 'Father', 'Hoa An, Lien Chieu, Da Nang', '0329287548', 'Electrician'),
('05620518', 'Huong', 'Le Thi', '1975-05-25', 'Mother', 'Hoa An, Lien Chieu, Da Nang', '0329287549', 'Teacher'),

-- Relatives for student 05620519
('05620519', 'Hai', 'Nguyen Van', '1969-08-12', 'Father', 'Cau Moi, Ha Long, Quang Ninh', '0320918268', 'Fisherman'),
('05620519', 'Hong', 'Pham Thi', '1973-11-28', 'Mother', 'Cau Moi, Ha Long, Quang Ninh', '0320918269', 'Tailor'),

-- Relatives for student 05620520
('05620520', 'Khanh', 'Nguyen Van', '1974-02-14', 'Father', 'Bai Chay, Ha Long, Quang Ninh', '0387326654', 'Tour Guide'),
('05620520', 'Nga', 'Tran Thi', '1978-07-19', 'Mother', 'Bai Chay, Ha Long, Quang Ninh', '0387326655', 'Receptionist'),

-- Relatives for student 05620521
('05620521', 'Long', 'Vo Van', '1972-09-03', 'Father', 'Quang Trung, Quang Yen, Quang Ninh', '0320975644', 'Construction Worker'),
('05620521', 'Thao', 'Nguyen Thi', '1976-12-08', 'Mother', 'Quang Trung, Quang Yen, Quang Ninh', '0320975645', 'Housewife'),

-- Relatives for student 05620522
('05620522', 'Manh', 'Nguyen Van', '1970-04-17', 'Father', 'Yen Thanh, Yen Hung, Quang Ninh', '0399706546', 'Miner'),
('05620522', 'Nhung', 'Nguyen Thi', '1974-10-22', 'Mother', 'Yen Thanh, Yen Hung, Quang Ninh', '0399706547', 'Teacher'),

-- Relatives for student 05620523
('05620523', 'Nam', 'Nguyen Hoang', '1973-01-30', 'Father', 'Mong Duong, Cam Pha, Quang Ninh', '0328100039', 'Driver'),
('05620523', 'Oanh', 'Le Thi', '1977-06-15', 'Mother', 'Mong Duong, Cam Pha, Quang Ninh', '0328100040', 'Shopkeeper'),

-- Relatives for student 05620524
('05620524', 'Phuc', 'Nguyen Van', '1971-03-25', 'Father', 'Uong Bi, Uong Bi, Quang Ninh', '0391203471', 'Electrician'),
('05620524', 'Quyen', 'Tran Thi', '1975-08-10', 'Mother', 'Uong Bi, Uong Bi, Quang Ninh', '0391203472', 'Nurse'),

-- Relatives for student 05620525
('05620525', 'Rinh', 'Vo Van', '1968-07-12', 'Father', 'Dong Tien, Luong Son, Hoa Binh', '0328906743', 'Farmer'),
('05620525', 'Suong', 'Nguyen Thi', '1972-12-18', 'Mother', 'Dong Tien, Luong Son, Hoa Binh', '0328906744', 'Housewife'),

-- Relatives for student 05620526
('05620526', 'Thang', 'Bui Van', '1974-05-20', 'Father', 'Mai Chau, Mai Chau, Hoa Binh', '0328109201', 'Tour Guide'),
('05620526', 'Trang', 'Nguyen Thi', '1978-10-05', 'Mother', 'Mai Chau, Mai Chau, Hoa Binh', '0328109202', 'Weaver'),

-- Relatives for student 05620527
('05620527', 'Tung', 'Nguyen Duc', '1970-11-15', 'Father', 'Dinh Hoa, Dinh Hoa, Thai Nguyen', '0328102981', 'Tea Farmer'),
('05620527', 'Uyen', 'Phan Thi', '1974-04-20', 'Mother', 'Dinh Hoa, Dinh Hoa, Thai Nguyen', '0328102982', 'Teacher'),

-- Relatives for student 05620528
('05620528', 'Vinh', 'Nguyen Van', '1973-02-28', 'Father', 'Son Cam, Thai Nguyen, Thai Nguyen', '0322134784', 'Miner'),
('05620528', 'Xuan', 'Nguyen Thi', '1977-07-15', 'Mother', 'Son Cam, Thai Nguyen, Thai Nguyen', '0322134785', 'Housewife'),

-- Relatives for student 05620529
('05620529', 'Yen', 'Phan Van', '1971-08-10', 'Father', 'Hoa Binh, Hoa Binh, Hoa Binh', '0320975424', 'Construction Worker'),
('05620529', 'Zung', 'Nguyen Thi', '1975-01-25', 'Mother', 'Hoa Binh, Hoa Binh, Hoa Binh', '0320975425', 'Tailor'),

-- Relatives for student 05620530
('05620530', 'Anh', 'Nguyen Van', '1974-06-18', 'Father', 'Lang Son, Lang Son, Lang Son', '0328100348', 'Shopkeeper'),
('05620530', 'Bich', 'Tran Thi', '1978-11-30', 'Mother', 'Lang Son, Lang Son, Lang Son', '0328100349', 'Housewife'),

-- Relatives for student 05620531
('05620531', 'Chien', 'Vo Van', '1972-03-15', 'Father', 'Phu Tan, Tan Phu, Dong Nai', '0326784593', 'Factory Worker'),
('05620531', 'Dung', 'Nguyen Thi', '1976-08-20', 'Mother', 'Phu Tan, Tan Phu, Dong Nai', '0326784594', 'Housewife'),

-- Relatives for student 05620532
('05620532', 'Giang', 'Nguyen Van', '1970-05-10', 'Father', 'Bac Giang, Bac Giang, Bac Giang', '0326735205', 'Farmer'),
('05620532', 'Hanh', 'Nguyen Thi', '1974-10-15', 'Mother', 'Bac Giang, Bac Giang, Bac Giang', '0326735206', 'Teacher'),

-- Relatives for student 05620533
('05620533', 'Khoa', 'Nguyen Van', '1973-01-20', 'Father', 'Tuy An, Tuy Hoa, Phu Yen', '0327843793', 'Fisherman'),
('05620533', 'Lien', 'Nguyen Thi', '1977-06-25', 'Mother', 'Tuy An, Tuy Hoa, Phu Yen', '0327843794', 'Seamstress'),

-- Relatives for student 05620534
('05620534', 'Minh', 'Nguyen Van', '1971-04-15', 'Father', 'Phu Ly, Phu Ly, Ha Nam', '0328129344', 'Driver'),
('05620534', 'Nga', 'Tran Thi', '1975-09-20', 'Mother', 'Phu Ly, Phu Ly, Ha Nam', '0328129345', 'Shopkeeper'),

-- Relatives for student 05620535
('05620535', 'Phu', 'Nguyen Van', '1974-07-25', 'Father', 'Duc Tho, Duc Tho, Ha Tinh', '0393280451', 'Teacher'),
('05620535', 'Quynh', 'Nguyen Thi', '1978-12-30', 'Mother', 'Duc Tho, Duc Tho, Ha Tinh', '0393280452', 'Nurse'),

-- Relatives for student 05620536
('05620536', 'Son', 'Nguyen Van', '1972-02-10', 'Father', 'Quynh Luu, Quynh Luu, Nghe An', '0924723456', 'Farmer'),
('05620536', 'Tam', 'Tran Thi', '1976-07-15', 'Mother', 'Quynh Luu, Quynh Luu, Nghe An', '0924723457', 'Housewife'),

-- Relatives for student 05620537
('05620537', 'Thanh', 'Tran Van', '1970-05-20', 'Father', 'Vinh, Vinh, Nghe An', '0739012013', 'Construction Worker'),
('05620537', 'Uyen', 'Nguyen Thi', '1974-10-25', 'Mother', 'Vinh, Vinh, Nghe An', '0739012014', 'Teacher'),

-- Relatives for student 05620538
('05620538', 'Viet', 'Nguyen Van', '1973-08-15', 'Father', 'Nam Dan, Nam Dan, Nghe An', '0928761452', 'Teacher'),
('05620538', 'Xuan', 'Nguyen Thi', '1977-01-20', 'Mother', 'Nam Dan, Nam Dan, Nghe An', '0928761453', 'Nurse'),

-- Relatives for student 05620539
('05620539', 'Yen', 'Bui Van', '1971-04-10', 'Father', 'Thanh Chuong, Thanh Chuong, Nghe An', '0322934735', 'Farmer'),

-- Relatives for student 05620540
('05620540', 'Anh', 'Nguyen Van', '1974-12-20', 'Father', 'Cua Lo, Cua Lo, Nghe An', '0329235484', 'Fisherman'),
('05620540', 'Binh', 'Nguyen Thi', '1978-05-25', 'Mother', 'Cua Lo, Cua Lo, Nghe An', '0329235485', 'Seamstress'),

-- Relatives for student 05620541
('05620541', 'Cuong', 'Tran Van', '1972-03-15', 'Father', 'Dien Chau, Dien Chau, Nghe An', '0391287452', 'Teacher');



--  Giả sử thời điểm truy cập là '2025-04-09'
INSERT INTO disciplinary_action VALUES
('DA001', 'Cleaning Duty', 'Violation of quiet hours', '2023-03-15', '2023-03-16', '2023-06-16', 'low', 'cancelled'),
('DA002', 'Community Service', 'Violation of quiet hours', '2023-04-20', '2023-04-21', NULL, 'expulsion', 'active'),
('DA003', 'Expulsion', 'Smoking in non-designated areas', '2023-02-10', '2023-02-11', '2023-04-11', 'high', 'active'),
('DA004', 'Expulsion', 'Physical assault or fighting', '2023-01-05', '2023-01-06', NULL, 'expulsion', 'active'),
('DA005', 'Yard Cleaning', 'Unauthorized guests', '2023-05-12', '2023-05-13', '2023-08-13', 'low', 'completed'),
('DA006', 'Classroom Setup', 'Physical assault or fighting', '2023-08-01', '2023-08-02', '2023-11-03', 'high', 'completed'),
('DA007', 'Dorm Cleaning', 'Physical assault or fighting', '2023-09-01', '2023-09-02', '2023-10-02', 'high', 'completed'),

('DA008', 'Cafeteria Duty', 'Harassment or bullying', '2025-02-20', '2025-02-21', '2025-05-21', 'medium', 'active'),
('DA009', 'Library Service', 'Unauthorized access to restricted areas', '2025-03-10', '2025-03-11', '2025-06-11', 'medium', 'active'),
('DA010', 'Hall Monitoring', 'Disregard for dormitory staff instructions', '2025-03-15', '2025-03-16', '2025-07-16', 'low', 'active');


--  student có 3 lần vi phạm hight->đuổi là 05620525

INSERT INTO student_discipline VALUES
('DA001', '05620513'),
('DA002', '05620520'),
('DA003', '05620525'),
('DA004', '05620529'),
('DA005', '05620530'),
('DA006', '05620525'),
('DA007', '05620525'),
('DA008', '05620531'),
('DA009', '05620515'),
('DA010', '05620537');




INSERT INTO dormitory_card (id_card)
VALUES
('05620513'),
('05620514'),
('05620515'),
('05620516'),
('05620517'),
('05620518'),
('05620519'),
('05620520'),
('05620521'),
('05620522'),
('05620523'),
('05620524'),
('05620525'),
('05620526'),
('05620527'),
('05620528'),
('05620529'),
('05620530'),
('05620531'),
('05620532'),
('05620533'),
('05620534'),
('05620535'),
('05620536'),
('05620537'),
('05620538'),
('05620539'),
('05620540'),
('05620541'),
('05620542'),
('05620543'),
('05620544'),
('05620545'),
('05620546'),
('05620547'),
('05620548'),
('05620549'),
('05620550'),
('05620551'),
('05620552');



--  ===========================================Function==========================================================
--  Số sinh viên bị kỉ luật trong khoảng thời gian(start,end)
Delimiter //
create function count_disciplined_students(
       start_date Date ,
       end_date   Date   
)
Returns int 
Deterministic
Begin 
	   Declare student_count int;
       
       if start_date > end_date then
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Start date must be less than end date';
	   end if;
       
       select count(distinct sd.sssn) into student_count 
       from student_discipline sd
       join disciplinary_action da on  sd.action_id = da.action_id
       where da.effective_from <= end_date and da.effective_to >= start_date and da.action_type not in ('expulsion');
       return student_count;
End //

-- tổng số sinh viên của 1 tòa:
CREATE FUNCTION total_students_by_building(bid CHAR(5))
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE total INT;
    
    IF LENGTH(REPLACE(TRIM(bid), ' ', '')) != 5 THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Building ID must be exactly 5 characters long.';
	END IF;

    SELECT SUM(current_num_of_students)
    INTO total
    FROM living_room
    WHERE building_id = bid;

    RETURN IFNULL(total, 0);
END;
//

-- trả về số thẻ nội trú chưa hết hạn.
DELIMITER $$

CREATE FUNCTION num_validity_dormitory_card() RETURNS INT DETERMINISTIC
BEGIN
    DECLARE num INT;
    SELECT COUNT(*) INTO num FROM dormitory_card WHERE Validity = 1;
    RETURN num;
END $$
DELIMITER ;





--  ============================================================Procedure==============================================================
-- kiểm tra 1 phòng trong 1 tòa cụ thể có đủ người ko.
DELIMITER //
CREATE PROCEDURE check_one_room_underoccupied(
    IN p_building_id CHAR(5),
    IN p_room_id CHAR(5)
)
BEGIN
	IF LENGTH(REPLACE(TRIM(p_building_id), ' ', '')) != 5 THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Building ID must be exactly 5 characters long.';
	END IF;
    
    IF LENGTH(REPLACE(TRIM(p_room_id), ' ', '')) != 5 THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room ID must be exactly 5 characters long.';
	END IF;

    SELECT 
        building_id,
        room_id,
        current_num_of_students,
        max_num_of_students,
        CONCAT(occupancy_rate, '%') AS occupancy_rate
    FROM living_room
    WHERE building_id = p_building_id
      AND room_id = p_room_id
      AND current_num_of_students < max_num_of_students;
END;
//


//
//


-- lấy ra danh sách sinh viên không có người thân.
DELIMITER $$

create procedure list_student_not_family()
begin
	select sssn, first_name, last_name
    from student 
    where sssn not in (
					select sssn from relative
                    );
end$$

DELIMITER ;


DELIMITER $$

-- Thống kê kỷ luật sinh viên theo từng lỗi vi phạm->Giúp thống kê loại vi phạm phổ biến
CREATE PROCEDURE get_violation_statistics_by_type(IN min_count INT)
BEGIN
    SELECT reason, COUNT(*) AS violation_count
    FROM student_discipline sd
    JOIN disciplinary_action da ON sd.action_id = da.action_id
    GROUP BY reason
    HAVING COUNT(*) >= min_count
    ORDER BY violation_count DESC;
END$$

DELIMITER ;

DELIMITER ;
-- +++++++++++++++++++++++++ USE FOR APPLICATION +++++++++++++++++++++++++++++++++++++++++
-- ===================================== user:

create TABLE manager_dorm (
  user_name VARCHAR(50) not null,
  password VARCHAR(255) NOT NULL,
  primary key(user_name, password)
);

DELIMITER //

-- get all student
DELIMITER //

CREATE PROCEDURE get_student()
BEGIN
  SELECT 
    s.sssn AS cccd,
    s.student_id,
    s.first_name,
    s.last_name,
    s.birthday,
    s.sex,
    s.health_state,
    s.ethnic_group,
    s.study_status,
    s.class_name,
    s.faculty,
    s.building_id,
    s.room_id,

    GROUP_CONCAT(DISTINCT ph.phone_number SEPARATOR '; ') AS phone_numbers,
    GROUP_CONCAT(DISTINCT CONCAT_WS(', ', a.commune, a.province) SEPARATOR '; ') AS addresses,
    GROUP_CONCAT(DISTINCT e.email SEPARATOR '; ') AS emails

  FROM student s
  JOIN dormitory_card dc 
       ON dc.id_card = s.sssn 
      AND dc.validity = TRUE
  LEFT JOIN phone_number ph 
       ON s.sssn = ph.sssn
  LEFT JOIN address a 
       ON s.sssn = a.sssn
  LEFT JOIN email e 
       ON s.sssn = e.sssn

  GROUP BY 
    s.sssn, s.student_id, s.first_name, s.last_name,
    s.birthday, s.sex, s.health_state, s.ethnic_group,
    s.study_status, s.class_name, s.faculty, s.building_id, s.room_id;
END //

DELIMITER ;

DELIMITER //

-- Add a manger dorm

CREATE PROCEDURE insert_manager_dorm(
    IN p_user_name VARCHAR(50),
    IN p_password VARCHAR(255)
)
BEGIN
    DECLARE user_exists INT;
    
    SELECT COUNT(*) INTO user_exists
    FROM manager_dorm
    WHERE user_name = p_user_name;
    IF user_exists > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User already exists';
    ELSE
        INSERT INTO manager_dorm (user_name, password)
        VALUES (p_user_name, p_password);
    END IF;
    
END //

-- check if a user exist
CREATE FUNCTION check_user_exists(p_user_name VARCHAR(50))
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE user_count INT;
    
    SELECT COUNT(*) INTO user_count
    FROM manager_dorm
    WHERE user_name = p_user_name;

    RETURN user_count > 0;
END //


CREATE PROCEDURE get_manager_dorm_by_username(IN p_user_name VARCHAR(255))
BEGIN
    SELECT * FROM manager_dorm WHERE user_name = p_user_name;
END;//

DELIMITER //


CREATE PROCEDURE delete_student_by_sssn(IN p_sssn CHAR(8))
BEGIN
    DECLARE count_student INT;

    -- Kiểm tra độ dài CCCD (SSSN)
    IF LENGTH(REPLACE(TRIM(p_sssn), ' ', '')) != 8 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'SSSN must be exactly 8 characters long.';
    END IF;

    -- Kiểm tra sinh viên có tồn tại không
    SELECT COUNT(*) INTO count_student
    FROM student
    WHERE sssn = p_sssn;

    IF count_student = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Student with this SSSN does not exist.';
    ELSE
        -- Hủy hiệu lực thẻ KTX (nếu có)
        UPDATE dormitory_card
        SET validity = FALSE
        WHERE id_card = p_sssn;

        -- Xóa liên kết phòng ở của sinh viên
        UPDATE student
        SET room_id = NULL, building_id = NULL
        WHERE sssn = p_sssn;

        -- (Tùy chọn) Xóa các thông tin liên lạc nếu có
        DELETE FROM phone_number WHERE sssn = p_sssn;
        DELETE FROM address WHERE sssn = p_sssn;
        DELETE FROM email WHERE sssn = p_sssn;

        -- (Tùy chọn) Xóa luôn sinh viên khỏi bảng student nếu cần
        -- DELETE FROM student WHERE sssn = p_sssn;
    END IF;
END //

DELIMITER ;



DELIMITER //


CREATE PROCEDURE get_student_by_sssn(IN p_sssn CHAR(8))
BEGIN
    -- Kiểm tra độ dài CCCD (SSSN)
    IF LENGTH(REPLACE(TRIM(p_sssn), ' ', '')) != 8 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'SSSN must be exactly 8 characters long.';
    END IF;

    -- Truy vấn thông tin sinh viên
    SELECT 
        s.sssn,
        s.first_name,
        s.last_name,
        s.birthday,
        s.sex,
        s.health_state,
        s.ethnic_group,
        s.student_id,
        s.study_status,
        s.class_name,
        s.faculty,
        s.building_id,
        s.room_id,

        -- Thông tin liên lạc (nếu có)
        GROUP_CONCAT(DISTINCT ph.phone_number SEPARATOR ';') AS phone_numbers,
        GROUP_CONCAT(DISTINCT CONCAT_WS(', ', a.commune, a.province) SEPARATOR ';') AS addresses,
        GROUP_CONCAT(DISTINCT e.email SEPARATOR ';') AS emails

    FROM student s
    LEFT JOIN phone_number ph ON s.sssn = ph.sssn
    LEFT JOIN address a ON s.sssn = a.sssn
    LEFT JOIN email e ON s.sssn = e.sssn
    WHERE s.sssn = p_sssn
    GROUP BY s.sssn, s.first_name, s.last_name, s.birthday, s.sex, 
             s.health_state, s.ethnic_group, s.student_id, s.study_status, 
             s.class_name, s.faculty, s.building_id, s.room_id;
END //

DELIMITER ;


DELIMITER //

-- insert new student


DELIMITER //

CREATE PROCEDURE insert_student (
    IN p_sssn CHAR(8),
    IN p_first_name VARCHAR(20),
    IN p_last_name VARCHAR(20),
    IN p_birthday DATE,
    IN p_sex CHAR(1),
    IN p_ethnic_group VARCHAR(30),
    IN p_health_state VARCHAR(100),
    IN p_student_id CHAR(12),
    IN p_study_status VARCHAR(20),
    IN p_class_name VARCHAR(30),
    IN p_faculty VARCHAR(50),
    IN p_building_id CHAR(5),
    IN p_room_id CHAR(5)
)
BEGIN
    -- Kiểm tra độ dài CCCD
    IF LENGTH(REPLACE(TRIM(p_sssn), ' ', '')) != 8 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'SSSN must be exactly 8 characters long.';
    END IF;

    -- Nếu người dùng nhập chuỗi rỗng cho room hoặc building => chuyển thành NULL
    IF p_building_id = '' THEN
        SET p_building_id = NULL;
    END IF;
    IF p_room_id = '' THEN
        SET p_room_id = NULL;
    END IF;

    -- Nếu có thông tin phòng ở thì kiểm tra tồn tại
    IF p_building_id IS NOT NULL AND p_room_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 
            FROM living_room 
            WHERE building_id = p_building_id AND room_id = p_room_id
        ) THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Room does not exist.';
        END IF;
    END IF;

    -- Kiểm tra xem sinh viên có bị trùng CCCD hoặc student_id không
    IF EXISTS (SELECT 1 FROM student WHERE sssn = p_sssn) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Student with this SSSN already exists.';
    END IF;

    IF EXISTS (SELECT 1 FROM student WHERE student_id = p_student_id) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Student ID already exists.';
    END IF;

    -- Thêm sinh viên mới
    INSERT INTO student (
        sssn, first_name, last_name, birthday, sex, ethnic_group,
        health_state, student_id, study_status, class_name, faculty,
        building_id, room_id
    )
    VALUES (
        p_sssn, p_first_name, p_last_name, p_birthday, p_sex, p_ethnic_group,
        p_health_state, p_student_id, p_study_status, p_class_name, p_faculty,
        p_building_id, p_room_id
    );
END //

DELIMITER ;

DELIMITER //


CREATE PROCEDURE insert_addresses (
	IN p_ssn CHAR(8),
	IN p_addresses TEXT
)
BEGIN
	DECLARE addr_index INT DEFAULT 1;
    DECLARE addr_item VARCHAR(255);
    DECLARE commune VARCHAR(30);
    DECLARE province VARCHAR(30);
    DECLARE num INT DEFAULT 0;
    DECLARE comma_count INT;

	IF p_addresses IS NOT NULL AND p_addresses != '' THEN
        SET num = LENGTH(p_addresses) - LENGTH(REPLACE(p_addresses, ';', '')) + 1;

        WHILE addr_index <= num DO
            SET addr_item = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p_addresses, ';', addr_index), ';', -1));

            IF addr_item != '' THEN
                SET comma_count = LENGTH(addr_item) - LENGTH(REPLACE(addr_item, ',', ''));
                IF comma_count < 0 OR comma_count > 2 THEN
                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid address format';
                END IF;

                IF comma_count = 2 THEN
                    SET commune = TRIM(SUBSTRING_INDEX(addr_item, ',', 1));
                    SET province = TRIM(SUBSTRING_INDEX(addr_item, ',', -1));
                ELSEIF comma_count = 1 THEN
                    SET commune = TRIM(SUBSTRING_INDEX(addr_item, ',', 1));
                    SET province = '';
                ELSE
                    SET commune = TRIM(addr_item);
                    SET province = '';
                END IF;

                IF EXISTS (
                    SELECT 1 FROM address A
					WHERE A.sssn = p_ssn
					  AND TRIM(LOWER(A.commune)) = TRIM(LOWER(commune))
					  AND TRIM(LOWER(A.province)) = TRIM(LOWER(province))
                ) THEN
                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'This address already exists';
                ELSE
                    INSERT INTO address (sssn, commune, province)
                    VALUES (p_ssn, commune, province);
                END IF;
            END IF;

            SET addr_index = addr_index + 1;
        END WHILE;
    END IF;
END;//

CREATE PROCEDURE insert_phone_numbers (
	IN p_ssn CHAR(8),
	IN p_phone_numbers TEXT
)
BEGIN
	DECLARE phone_index INT DEFAULT 1;
    DECLARE phone_item CHAR(10);
    DECLARE num INT DEFAULT 0;

	IF p_phone_numbers IS NOT NULL AND p_phone_numbers != '' THEN
        SET num = LENGTH(p_phone_numbers) - LENGTH(REPLACE(p_phone_numbers, ';', '')) + 1;

        WHILE phone_index <= num DO
            SET phone_item = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p_phone_numbers, ';', phone_index), ';', -1));

            IF phone_item != '' THEN
                IF LENGTH(phone_item) != 10 OR phone_item REGEXP '[^0-9]' THEN
                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid phone number';
                END IF;

                IF EXISTS (
                    SELECT 1 FROM phone_number
                    WHERE sssn = p_ssn AND phone_number = phone_item
                ) THEN
                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'This phone number already exists';
                ELSE
                    INSERT INTO phone_number (sssn, phone_number)
                    VALUES (p_ssn, phone_item);
                END IF;
            END IF;

            SET phone_index = phone_index + 1;
        END WHILE;
    END IF;
END;//


CREATE PROCEDURE insert_emails (
	IN p_ssn CHAR(8),
	IN p_emails TEXT
)
BEGIN
	DECLARE email_index INT DEFAULT 1;
    DECLARE email_item VARCHAR(50);
    DECLARE num INT DEFAULT 0;

	IF p_emails IS NOT NULL AND p_emails != '' THEN
        SET num = LENGTH(p_emails) - LENGTH(REPLACE(p_emails, ';', '')) + 1;
        WHILE email_index <= num DO
            SET email_item = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p_emails, ';', email_index), ';', -1));
            IF email_item != '' THEN
                IF NOT (email_item REGEXP '^[^@]+@[^@]+\\.[^@]+$') THEN
                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid email';
                END IF;
                IF EXISTS (
                    SELECT 1 FROM email
                    WHERE sssn = p_ssn AND email = email_item
                ) THEN
                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'This email already exists';
                ELSE
                    INSERT INTO email (sssn, email)
                    VALUES (p_ssn, email_item);
                END IF;
            END IF;
            SET email_index = email_index + 1;
        END WHILE;
    END IF;
END;//

DELIMITER //

CREATE PROCEDURE add_new_student (
    IN p_ssn CHAR(8),
    IN p_last_name VARCHAR(20),
    IN p_first_name VARCHAR(20),
    IN p_birthday DATE,
    IN p_sex CHAR(1),
    IN p_health_state VARCHAR(100),
    IN p_ethnic_group VARCHAR(30),
    IN p_student_id CHAR(7),
    IN p_has_health_insurance BOOLEAN,
    IN p_study_status VARCHAR(20),
    IN p_class_name VARCHAR(20),
    IN p_faculty VARCHAR(50),
    IN p_building_id CHAR(5),
    IN p_room_id CHAR(5),
    IN p_addresses TEXT,
    IN p_phone_numbers TEXT,
    IN p_emails TEXT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1 @p_message = MESSAGE_TEXT;
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = @p_message;
    END;
    
    START TRANSACTION;
    
    -- Validation
    IF LENGTH(REPLACE(TRIM(p_ssn), ' ', '')) != 8 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'SSN must be exactly 8 characters long.';
    END IF;
    
    IF LENGTH(TRIM(p_first_name)) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'First name is required';
    END IF;
    
    IF LENGTH(TRIM(p_last_name)) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Last name is required';
    END IF;
    
    IF LENGTH(REPLACE(TRIM(p_student_id), ' ', '')) != 7 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student ID must be exactly 7 characters long.';
    END IF;
    
    -- Thay đổi p_sssn thành p_ssn
    CALL insert_student(p_ssn, p_first_name, p_last_name, p_birthday, p_sex, p_ethnic_group, p_health_state, p_student_id, p_study_status, p_class_name, p_faculty, p_building_id, p_room_id);
    CALL insert_addresses(p_ssn, p_addresses);
    CALL insert_phone_numbers(p_ssn, p_phone_numbers);
    CALL insert_emails(p_ssn, p_emails);
    
    COMMIT;
END;//

DELIMITER ;



DELIMITER //

CREATE PROCEDURE update_student_info (
    IN p_sssn CHAR(8),
    IN p_first_name VARCHAR(20),
    IN p_last_name VARCHAR(20),
    IN p_birthday DATE,
    IN p_sex CHAR(1),
    IN p_ethnic_group VARCHAR(30),
    IN p_health_state VARCHAR(100),
    IN p_student_id CHAR(12),
    IN p_study_status VARCHAR(20),
    IN p_class_name VARCHAR(30),
    IN p_faculty VARCHAR(50),
    IN p_building_id CHAR(5),
    IN p_room_id CHAR(5)
)
BEGIN
    -- Kiểm tra độ dài CCCD
    IF LENGTH(REPLACE(TRIM(p_sssn), ' ', '')) != 8 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'SSSN must be exactly 8 characters long.';
    END IF;

    -- Chuyển chuỗi rỗng thành NULL
    IF p_building_id = '' THEN
        SET p_building_id = NULL;
    END IF;
    IF p_room_id = '' THEN
        SET p_room_id = NULL;
    END IF;

    -- Kiểm tra phòng tồn tại nếu có thông tin
    IF p_building_id IS NOT NULL AND p_room_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM living_room
            WHERE building_id = p_building_id AND room_id = p_room_id
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Room does not exist.';
        END IF;
    END IF;

    -- Cập nhật thông tin sinh viên
    UPDATE student
    SET 
        first_name = p_first_name,
        last_name = p_last_name,
        birthday = p_birthday,
        sex = p_sex,
        ethnic_group = p_ethnic_group,
        health_state = p_health_state,
        student_id = p_student_id,
        study_status = p_study_status,
        class_name = p_class_name,
        faculty = p_faculty,
        building_id = p_building_id,
        room_id = p_room_id
    WHERE sssn = p_sssn;

    -- Nếu không có sinh viên nào được cập nhật
    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Student not found.';
    END IF;
END //

DELIMITER ;

DELIMITER //


CREATE PROCEDURE delete_contact_info (
    IN p_ssn CHAR(8)
)
BEGIN
    DELETE FROM address WHERE sssn = p_ssn;
    DELETE FROM phone_number WHERE sssn = p_ssn;
    DELETE FROM email WHERE sssn = p_ssn;
END;//

CREATE PROCEDURE update_student (
    IN p_new_ssn CHAR(8),
    IN p_ssn CHAR(8),
    IN p_last_name VARCHAR(20),
    IN p_first_name VARCHAR(20),
    IN p_birthday DATE,
    IN p_sex CHAR(1),
    IN p_health_state VARCHAR(100),
    IN p_ethnic_group VARCHAR(30),
    IN p_student_id CHAR(7),
    IN p_has_health_insurance BOOLEAN,
    IN p_study_status VARCHAR(20),
    IN p_class_name VARCHAR(20),
    IN p_faculty VARCHAR(50),
    IN p_building_id CHAR(5),
    IN p_room_id CHAR(5),
    IN p_addresses TEXT,
    IN p_phone_numbers TEXT,
    IN p_emails TEXT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1 @p_message = MESSAGE_TEXT;
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = @p_message;
    END;
    
    START TRANSACTION;
    
    -- Validation
    IF LENGTH(REPLACE(TRIM(p_ssn), ' ', '')) != 8 OR LENGTH(REPLACE(TRIM(p_new_ssn), ' ', '')) != 8 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'SSN must be exactly 8 characters long.';
    END IF;
    
    IF LENGTH(TRIM(p_first_name)) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'First name is required';
    END IF;
    
    IF LENGTH(TRIM(p_last_name)) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Last name is required';
    END IF;
    
    IF LENGTH(REPLACE(TRIM(p_student_id), ' ', '')) != 7 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student ID must be exactly 7 characters long.';
    END IF;
    
    IF p_ssn = p_new_ssn THEN
        -- Thay đổi p_sssn thành p_ssn
        CALL update_student_info(p_ssn, p_first_name, p_last_name, p_birthday, p_sex, p_ethnic_group, p_health_state, p_student_id, p_study_status, p_class_name, p_faculty, p_building_id, p_room_id);
        CALL delete_contact_info(p_ssn);
        CALL insert_addresses(p_ssn, p_addresses);
        CALL insert_phone_numbers(p_ssn, p_phone_numbers);
        CALL insert_emails(p_ssn, p_emails);
    ELSE
        -- Thay đổi p_sssn thành p_new_ssn
        CALL insert_student(p_new_ssn, p_first_name, p_last_name, p_birthday, p_sex, p_ethnic_group, p_health_state, p_student_id, p_study_status, p_class_name, p_faculty, p_building_id, p_room_id);
        CALL insert_addresses(p_new_ssn, p_addresses);
        CALL insert_phone_numbers(p_new_ssn, p_phone_numbers);
        CALL insert_emails(p_new_ssn, p_emails);
        -- Có thể cần xóa student cũ
        CALL delete_student_by_sssn(p_ssn);
    END IF;
    
    COMMIT;
END;


DELIMITER $$


CREATE PROCEDURE create_dormitory_card(IN p_ssn CHAR(8))
BEGIN
    INSERT INTO dormitory_card (id_card)
    VALUES (p_ssn);
END$$



DELIMITER $$

CREATE FUNCTION check_dormitory_card(p_sssn CHAR(8))
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE card_count INT DEFAULT 0;
    DECLARE card_validity BOOLEAN DEFAULT NULL;

    -- Kiểm tra có thẻ hay không
    SELECT COUNT(*), MAX(validity) INTO card_count, card_validity
    FROM dormitory_card
    WHERE id_card = p_sssn;

    -- Xử lý 3 trường hợp
    IF card_count = 0 THEN
        RETURN 0;
    ELSEIF card_validity = 1 THEN
        RETURN 2;
    ELSE
        RETURN 1;
    END IF;
END$$

DELIMITER $$

CREATE PROCEDURE set_validity_dormitory_card(p_sssn CHAR(8))
BEGIN
    UPDATE dormitory_card
    SET validity = 1
    WHERE id_card = p_sssn;
END$$

DELIMITER ;


DELIMITER ;





















-- =====================================
-- ROOM MANAGEMENT PROCEDURES
-- =====================================

DELIMITER $$

-- Procedure to list all rooms in a specific building
CREATE PROCEDURE list_rooms_building(
    IN p_building_id CHAR(5)
)
BEGIN
    -- Validate building ID length
    IF LENGTH(REPLACE(TRIM(p_building_id), ' ', '')) != 5 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Building ID must be exactly 5 characters long.';
    END IF;

    -- Select rooms from the specified building
    SELECT 
        building_id,
        room_id,
        current_num_of_students,
        max_num_of_students,
        occupancy_rate,
        CONCAT(occupancy_rate, '%') AS formatted_occupancy_rate
    FROM living_room
    WHERE building_id = p_building_id
    ORDER BY room_id;
END$$

-- Procedure to list all rooms
CREATE PROCEDURE list_all_rooms()
BEGIN
    SELECT 
        building_id,
        room_id,
        current_num_of_students,
        max_num_of_students,
        occupancy_rate,
        CONCAT(occupancy_rate, '%') AS formatted_occupancy_rate
    FROM living_room
    ORDER BY building_id, room_id;
END$$

-- Procedure to list all underoccupied rooms
CREATE PROCEDURE list_all_underoccupied_rooms()
BEGIN
    SELECT 
        building_id,
        room_id,
        current_num_of_students,
        max_num_of_students,
        occupancy_rate,
        CONCAT(occupancy_rate, '%') AS formatted_occupancy_rate
    FROM living_room
    WHERE current_num_of_students < max_num_of_students
    ORDER BY building_id, room_id;
END$$

-- Procedure to list underoccupied rooms by building
CREATE PROCEDURE list_underoccupied_by_building(
    IN p_building_id CHAR(5)
)
BEGIN
    -- Validate building ID length
    IF LENGTH(REPLACE(TRIM(p_building_id), ' ', '')) != 5 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Building ID must be exactly 5 characters long.';
    END IF;

    -- Select underoccupied rooms from the specified building
    SELECT 
        building_id,
        room_id,
        current_num_of_students,
        max_num_of_students,
        occupancy_rate,
        CONCAT(occupancy_rate, '%') AS formatted_occupancy_rate
    FROM living_room
    WHERE building_id = p_building_id 
      AND current_num_of_students < max_num_of_students
    ORDER BY room_id;
END$$

DELIMITER ;