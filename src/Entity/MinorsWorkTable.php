<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * MinorsWorkTable
 *
 * @ORM\Table(name="Users.Minors_Work_Table", uniqueConstraints={@ORM\UniqueConstraint(name="Certificate_ID_UNIQUE", columns={"Certificate_ID"})}, indexes={@ORM\Index(name="fk_Minors_Work_Table_User_Table1_idx", columns={"User_Table_User_ID"}), @ORM\Index(name="fk_Minors_Work_Table_Confirmation_Staus1_idx", columns={"Status_ID"})})
 * @ORM\Entity
 */
class MinorsWorkTable
{
    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Document_Date", type="datetime", nullable=true)
     */
    private $documentDate;

    /**
     * @var integer
     *
     * @ORM\Column(name="Certificate_ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $certificateId;

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
     * Set documentDate
     *
     * @param \DateTime $documentDate
     *
     * @return MinorsWorkTable
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
     * Get certificateId
     *
     * @return integer
     */
    public function getCertificateId()
    {
        return $this->certificateId;
    }

    /**
     * Set userTableUser
     *
     * @param \App\Entity\UserTable $userTableUser
     *
     * @return MinorsWorkTable
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
     * @return MinorsWorkTable
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
