<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * PoliceCheckTable
 *
 * @ORM\Table(name="Users.Police_Check_Table", uniqueConstraints={@ORM\UniqueConstraint(name="Check_ID_UNIQUE", columns={"Check_ID"})}, indexes={@ORM\Index(name="fk_Police_Check_Table_User_Table1_idx", columns={"User_Table_User_ID"}), @ORM\Index(name="fk_Police_Check_Table_Confirmation_Staus1_idx", columns={"Status_ID"})})
 * @ORM\Entity
 */
class PoliceCheckTable
{
    /**
     * @var string
     *
     * @ORM\Column(name="Document_File", type="string", length=45, nullable=true)
     */
    private $documentFile;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Document_Date", type="datetime", nullable=true)
     */
    private $documentDate;

    /**
     * @var integer
     *
     * @ORM\Column(name="Check_ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $checkId;

    /**
     * @var \App\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\UserTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="User_Table_User_ID", referencedColumnName="User_ID")
     * })
     */
    private $userTableUser;

    /**
     * @var \App\Entity\ConfirmationStaus
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\ConfirmationStaus")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Status_ID", referencedColumnName="Status_ID")
     * })
     */
    private $status;



    /**
     * Set documentFile
     *
     * @param string $documentFile
     *
     * @return PoliceCheckTable
     */
    public function setDocumentFile($documentFile)
    {
        $this->documentFile = $documentFile;

        return $this;
    }

    /**
     * Get documentFile
     *
     * @return string
     */
    public function getDocumentFile()
    {
        return $this->documentFile;
    }

    /**
     * Set documentDate
     *
     * @param \DateTime $documentDate
     *
     * @return PoliceCheckTable
     */
    public function setDocumentDate($documentDate)
    {
        $this->documentDate = $documentDate;

        return $this;
    }

    /**
     * Get documentDate
     *
     * @return \DateTime
     */
    public function getDocumentDate()
    {
        return $this->documentDate;
    }

    /**
     * Get checkId
     *
     * @return integer
     */
    public function getCheckId()
    {
        return $this->checkId;
    }

    /**
     * Set userTableUser
     *
     * @param \App\Entity\UserTable $userTableUser
     *
     * @return PoliceCheckTable
     */
    public function setUserTableUser(\App\Entity\UserTable $userTableUser = null)
    {
        $this->userTableUser = $userTableUser;

        return $this;
    }

    /**
     * Get userTableUser
     *
     * @return \App\Entity\UserTable
     */
    public function getUserTableUser()
    {
        return $this->userTableUser;
    }

    /**
     * Set status
     *
     * @param \App\Entity\ConfirmationStaus $status
     *
     * @return PoliceCheckTable
     */
    public function setStatus(\App\Entity\ConfirmationStaus $status = null)
    {
        $this->status = $status;

        return $this;
    }

    /**
     * Get status
     *
     * @return \App\Entity\ConfirmationStaus
     */
    public function getStatus()
    {
        return $this->status;
    }
}
