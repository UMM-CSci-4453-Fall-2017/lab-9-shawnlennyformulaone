DROP PROCEDURE IF EXISTS saleProcedure;

DELIMITER //

CREATE PROCEDURE saleProcedure(userName TEXT)

BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE itID INT;
    DECLARE itName TEXT;
    DECLARE qnty INT;
    DECLARE tPrice INT;
    DECLARE clock TIMESTAMP;
    DECLARE newTransactionID INT;
    DECLARE cur1 CURSOR FOR SELECT * FROM transactions;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = true;

    IF 0 = (SELECT COUNT(*) FROM archive) THEN
      SET newTransactionID = 0;
    ELSE
      SET newTransactionID = (SELECT MAX(transactionID) FROM archive)+1;
    END IF;

    OPEN cur1;

    read_loop: LOOP
        FETCH cur1 INTO itID, itName, qnty, tPrice, clock;
        IF done THEN
            LEAVE read_loop;
        END IF;
            INSERT INTO archive VALUES (newTransactionID, userName, itID, itName, qnty, tPrice, clock);
    END LOOP;
END; //
DELIMITER ;
