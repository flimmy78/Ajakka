CREATE TABLE IF NOT EXISTS vendors (
	oui CHAR(6) NOT NULL,
	name VARCHAR(255) NOT NULL,
    PRIMARY KEY (oui)
)
ENGINE=InnoDB
;